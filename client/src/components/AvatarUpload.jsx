import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Camera, Loader2, Trash2 } from 'lucide-react';
import { profilesApi } from '../api/profiles.js';
import { apiErrorMessage } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { fileUrl, initials } from '../utils/format.js';

const MAX_MB = 5;
const ACCEPTED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

/** Accessible profile-photo upload backed by Giggo's authenticated profile API. */
export function AvatarUpload({ size = 96 }) {
  const { user, setUser } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const inputRef = useRef(null);
  const queryClient = useQueryClient();

  useEffect(() => setImageFailed(false), [user?.avatar]);

  const refreshProfileCaches = () => {
    void queryClient.invalidateQueries({ queryKey: ['profile'] });
    void queryClient.invalidateQueries({ queryKey: ['talent'] });
  };

  const onPick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-selecting the same file
    if (!file) return;
    if (!ACCEPTED_TYPES.has(file.type)) return toast.error('Choose a JPEG, PNG, or WebP image');
    if (file.size > MAX_MB * 1024 * 1024) return toast.error(`Image must be ${MAX_MB} MB or smaller`);

    setUploading(true);
    try {
      const { avatar } = await profilesApi.uploadAvatar(file);
      setUser((u) => ({ ...u, avatar }));
      refreshProfileCaches();
      toast.success('Photo updated');
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Upload failed'));
    } finally {
      setUploading(false);
    }
  };

  const onRemove = async () => {
    if (!window.confirm('Remove your current profile photo?')) return;
    setUploading(true);
    try {
      const result = await profilesApi.removeAvatar();
      setUser((current) => ({ ...current, avatar: '' }));
      refreshProfileCaches();
      if (result.remoteCopyMayRemain) {
        toast.success('Photo removed from Giggo; the image host may retain its copy');
      } else {
        toast.success('Photo removed');
      }
    } catch (error) {
      toast.error(apiErrorMessage(error, 'Could not remove photo'));
    } finally {
      setUploading(false);
    }
  };

  const showImage = user?.avatar && !imageFailed;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {showImage ? (
        <img
          src={fileUrl(user.avatar)}
          alt={user?.name || 'Avatar'}
          className="h-full w-full rounded-full object-cover ring-2 ring-white shadow"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center rounded-full bg-brand-100 text-xl font-bold text-brand-700 ring-2 ring-white shadow">
          {initials(user?.name) || '?'}
        </div>
      )}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="absolute bottom-0 right-0 grid h-8 w-8 place-items-center rounded-full bg-brand-600 text-white shadow hover:bg-brand-700 disabled:opacity-70"
        aria-label={uploading ? 'Uploading profile photo' : 'Change profile photo'}
      >
        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
      </button>
      {user?.avatar && (
        <button
          type="button"
          onClick={onRemove}
          disabled={uploading}
          className="absolute right-0 top-0 grid h-7 w-7 place-items-center rounded-full bg-white text-red-600 shadow ring-1 ring-slate-200 hover:bg-red-50 disabled:opacity-70"
          aria-label="Remove profile photo"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      )}
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={onPick} />
      <span className="sr-only" aria-live="polite">{uploading ? 'Uploading profile photo' : ''}</span>
    </div>
  );
}
