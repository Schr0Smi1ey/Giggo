import mongoose from 'mongoose';

const { Schema } = mongoose;

const analysisSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    feature: { type: String, enum: ['cv_analysis'], default: 'cv_analysis', index: true },
    provider: { type: String, default: 'mock' },
    model: { type: String, default: 'mock-deterministic' },
    textHash: { type: String, required: true, index: true },
    source: {
      kind: { type: String, enum: ['cv_file', 'text'], required: true },
      filename: { type: String, default: '' },
    },
    result: {
      summary: { type: String, default: '' },
      overallScore: { type: Number, min: 0, max: 100, default: 0 },
      atsScore: { type: Number, min: 0, max: 100, default: 0 },
      detectedSkills: { type: [String], default: [] },
      suggestedSkills: { type: [String], default: [] },
      experienceYears: { type: Number, min: 0, default: 0 },
      seniority: { type: String, enum: ['junior', 'mid', 'senior', 'lead'], default: 'junior' },
      strengths: { type: [String], default: [] },
      weaknesses: { type: [String], default: [] },
      recommendations: {
        type: [{ _id: false, title: String, detail: String, priority: { type: String, enum: ['high', 'medium', 'low'] } }],
        default: [],
      },
      missingSections: { type: [String], default: [] },
      wordCount: { type: Number, default: 0 },
      disclaimer: { type: String, default: '' },
    },
  },
  { timestamps: true, versionKey: false },
);

analysisSchema.index({ user: 1, feature: 1, textHash: 1 });
analysisSchema.index({ user: 1, feature: 1, createdAt: -1 });

export const AIAnalysis = mongoose.model('AIAnalysis', analysisSchema);
