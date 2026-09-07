import fs from 'node:fs/promises';
import { AIAnalysis } from '../models/AIAnalysis.js';
import { FreelancerProfile } from '../models/FreelancerProfile.js';
import { ApiError } from '../utils/ApiError.js';
import { extractText, sha256, wordCount } from '../utils/text.js';
import { getAIProvider } from '../integrations/ai/index.js';

const disclaimer = 'This analysis is advisory only. It assesses CV presentation, not identity or the truth of any claim.';
const dictionary = ['javascript', 'typescript', 'python', 'java', 'react', 'vue', 'angular', 'node.js', 'express', 'mongodb', 'postgresql', 'mysql', 'docker', 'aws', 'azure', 'git', 'github actions', 'figma', 'html', 'css', 'tailwind', 'machine learning', 'pytorch', 'tensorflow', 'data analysis', 'project management', 'communication', 'marketing'];
const sections = {
  summary: /\b(summary|objective|profile|about)\b/i,
  experience: /\b(experience|employment|work history|professional background)\b/i,
  education: /\b(education|academic|degree|university|bachelor|master|phd)\b/i,
  skills: /\b(skills|technologies|competencies|proficienc)/i,
  contact: /(@|\bphone\b|\bemail\b|linkedin\.com|github\.com)/i,
};

function clamp(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function seniority(years) {
  if (years >= 8) return 'lead';
  if (years >= 5) return 'senior';
  if (years >= 2) return 'mid';
  return 'junior';
}

function heuristicAnalysis(text) {
  const lower = text.toLowerCase();
  const words = wordCount(text);
  const detectedSkills = dictionary.filter((skill) => lower.includes(skill));
  const years = [...text.matchAll(/(\d{1,2})\s*\+?\s*(?:years|yrs)\b/gi)].map((match) => Number(match[1]));
  const experienceYears = years.length ? Math.min(40, Math.max(...years)) : 0;
  const present = Object.entries(sections).filter(([, pattern]) => pattern.test(text)).map(([name]) => name);
  const missingSections = Object.keys(sections).filter((name) => !present.includes(name));
  const quantified = /\d+%|\$\d|\d+\s*(?:users|clients|projects|k\b)/i.test(text);
  const overallScore = clamp((present.length / 5) * 45 + Math.min(30, detectedSkills.length * 3) + (words >= 250 && words <= 1200 ? 25 : words < 250 ? (words / 250) * 25 : 15));
  const atsScore = clamp((present.includes('contact') ? 25 : 0) + (present.includes('skills') ? 25 : 0) + (detectedSkills.length >= 5 ? 25 : detectedSkills.length * 5) + (quantified ? 25 : 10));
  const strengths = [
    ...(detectedSkills.length >= 6 ? [`Strong technical breadth (${detectedSkills.length} recognizable skills).`] : []),
    ...(present.includes('experience') ? ['Clear work-experience section.'] : []),
    ...(quantified ? ['Includes quantified, measurable achievements.'] : []),
  ];
  const weaknesses = [
    ...(missingSections.includes('summary') ? ['No professional summary near the top.'] : []),
    ...(missingSections.includes('skills') ? ['No dedicated skills section for ATS keyword matching.'] : []),
    ...(!quantified ? ['Achievements are not quantified with metrics.'] : []),
    ...(words < 250 ? ['CV is short — add more detail on impact and scope.'] : []),
  ];
  const recommendations = [
    ...(missingSections.includes('skills') ? [{ title: 'Add a skills section', detail: 'List core tools and technologies so recruiters can match you quickly.', priority: 'high' }] : []),
    ...(!quantified ? [{ title: 'Quantify achievements', detail: 'Turn duties into outcomes with numbers and measurable results.', priority: 'high' }] : []),
    ...(missingSections.includes('summary') ? [{ title: 'Add a headline summary', detail: 'Open with 2–3 lines stating your role, focus, and strengths.', priority: 'medium' }] : []),
  ];
  return {
    summary: `Detected ${detectedSkills.length} skills across approximately ${words} words with an estimated ${experienceYears} year(s) of experience.`,
    overallScore,
    atsScore,
    detectedSkills,
    experienceYears,
    seniority: seniority(experienceYears),
    strengths: strengths.length ? strengths : ['CV text is readable and parseable.'],
    weaknesses: weaknesses.length ? weaknesses : ['No major presentation gaps detected.'],
    recommendations: recommendations.length ? recommendations : [{ title: 'Tailor each application', detail: 'Mirror the language of the job description where it truthfully matches your experience.', priority: 'low' }],
    missingSections,
    wordCount: words,
  };
}

function promptFor(text) {
  return [
    { role: 'system', content: 'Analyze this CV for presentation only. Return strict JSON with summary, overallScore, atsScore, detectedSkills, experienceYears, seniority, strengths, weaknesses, recommendations, and missingSections. Never verify identity or claims.' },
    { role: 'user', content: text },
  ];
}

function normalizeProviderResult(raw, fallback) {
  try {
    const value = JSON.parse(raw);
    if (!value || !Array.isArray(value.detectedSkills)) return fallback;
    return {
      ...fallback,
      ...value,
      overallScore: clamp(Number(value.overallScore)),
      atsScore: clamp(Number(value.atsScore)),
      detectedSkills: value.detectedSkills.map(String).slice(0, 30),
      strengths: Array.isArray(value.strengths) ? value.strengths.map(String).slice(0, 10) : fallback.strengths,
      weaknesses: Array.isArray(value.weaknesses) ? value.weaknesses.map(String).slice(0, 10) : fallback.weaknesses,
      recommendations: Array.isArray(value.recommendations) ? value.recommendations.slice(0, 10) : fallback.recommendations,
      missingSections: Array.isArray(value.missingSections) ? value.missingSections.map(String).slice(0, 10) : fallback.missingSections,
    };
  } catch {
    return fallback;
  }
}

async function loadCvText(profile) {
  if (!profile.cv?.path) throw ApiError.badRequest('Upload a CV or paste CV text before analysis');
  const buffer = await fs.readFile(profile.cv.path).catch(() => null);
  const text = extractText(buffer, profile.cv.filename);
  if (!text) throw ApiError.badRequest('Could not read this CV. Paste its text into the analyzer instead.');
  return { text, source: { kind: 'cv_file', filename: profile.cv.filename } };
}

async function ownedAnalysis(user, id) {
  const analysis = await AIAnalysis.findOne({ _id: id, user: user._id, feature: 'cv_analysis' });
  if (!analysis) throw ApiError.notFound('Analysis not found');
  return analysis;
}

export const aiService = {
  async analyzeCv(user, { text, force = false }) {
    const profile = await FreelancerProfile.findOne({ user: user._id });
    if (!profile) throw ApiError.badRequest('Complete your freelancer profile before analyzing a CV');
    const loaded = text?.trim() ? { text: text.trim(), source: { kind: 'text', filename: '' } } : await loadCvText(profile);
    const cvText = loaded.text.slice(0, 60000);
    if (cvText.length < 30) throw ApiError.badRequest('Provide at least 30 characters of CV text');
    const textHash = sha256(cvText);
    if (!force) {
      const cached = await AIAnalysis.findOne({ user: user._id, feature: 'cv_analysis', textHash }).sort({ createdAt: -1 });
      if (cached) return cached;
    }
    const fallback = heuristicAnalysis(cvText);
    const provider = getAIProvider();
    const providerResult = provider.name === 'mock' ? fallback : normalizeProviderResult((await provider.chat({ messages: promptFor(cvText) })).content, fallback);
    const existing = new Set((profile.skills || []).map((skill) => skill.toLowerCase()));
    const suggestedSkills = providerResult.detectedSkills.filter((skill) => !existing.has(skill.toLowerCase())).slice(0, 30);
    return AIAnalysis.create({
      user: user._id,
      provider: provider.name,
      model: provider.model,
      textHash,
      source: loaded.source,
      result: { ...providerResult, suggestedSkills, disclaimer },
    });
  },

  async latest(user) {
    return AIAnalysis.findOne({ user: user._id, feature: 'cv_analysis' }).sort({ createdAt: -1 });
  },

  async list(user, { page = 1, limit = 10 }) {
    const [items, total] = await Promise.all([
      AIAnalysis.find({ user: user._id, feature: 'cv_analysis' }).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      AIAnalysis.countDocuments({ user: user._id, feature: 'cv_analysis' }),
    ]);
    return { items, page, limit, total };
  },

  get(user, id) {
    return ownedAnalysis(user, id);
  },

  async remove(user, id) {
    const analysis = await ownedAnalysis(user, id);
    await analysis.deleteOne();
  },

  async applySkills(user, id) {
    const [analysis, profile] = await Promise.all([ownedAnalysis(user, id), FreelancerProfile.findOne({ user: user._id })]);
    if (!profile) throw ApiError.badRequest('Freelancer profile not found');
    const known = new Set((profile.skills || []).map((skill) => skill.toLowerCase()));
    const added = (analysis.result.suggestedSkills || []).filter((skill) => !known.has(skill.toLowerCase())).slice(0, Math.max(0, 30 - known.size));
    if (added.length) {
      profile.skills = [...profile.skills, ...added];
      await profile.save();
    }
    return { profile, added };
  },
};
