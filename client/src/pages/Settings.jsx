import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { changePasswordSchema } from '../validators/auth.schemas.js';
import { useAuth } from '../context/AuthContext.jsx';
import { api, apiErrorMessage } from '../api/client.js';
import { Input } from '../components/Input.jsx';
import { Button } from '../components/Button.jsx';

export default function Settings() {
  const { logout, reauthenticate, updatePassword } = useAuth();
  const navigate = useNavigate();
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [deleting, setDeleting] = useState(false);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(changePasswordSchema),
  });

  const onChangePassword = async (values) => {
    try {
      await updatePassword({ currentPassword: values.currentPassword, newPassword: values.newPassword });
      toast.success('Password changed — please log in again');
      reset();
      await logout();
      navigate('/login');
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Could not change password'));
    }
  };

  const onDelete = async () => {
    if (deleteConfirmation !== 'DELETE') {
      toast.error('Type DELETE exactly to confirm account deletion');
      return;
    }
    if (!deletePassword) {
      toast.error('Enter your current password');
      return;
    }
    setDeleting(true);
    try {
      await reauthenticate(deletePassword);
      const response = await api.delete('/auth/account', { data: { confirmation: 'DELETE' } });
      if (response.data.data.remoteAvatarCopyMayRemain) {
        toast.success('Giggo account deleted; the image host may retain its copy');
      } else {
        toast.success('Account deleted');
      }
      await logout().catch(() => {});
      navigate('/');
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Could not delete account'));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-slate-900">Settings</h1>

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-slate-900">Change password</h2>
        <form onSubmit={handleSubmit(onChangePassword)} className="mt-4 space-y-4" noValidate>
          <Input label="Current password" type="password" autoComplete="current-password" error={errors.currentPassword?.message} {...register('currentPassword')} />
          <Input label="New password" type="password" autoComplete="new-password" error={errors.newPassword?.message} {...register('newPassword')} />
          <Input label="Confirm new password" type="password" autoComplete="new-password" error={errors.confirm?.message} {...register('confirm')} />
          <Button type="submit" loading={isSubmitting}>Update password</Button>
        </form>
      </section>

      <section className="mt-6 rounded-xl border border-red-200 bg-red-50 p-6">
        <h2 className="font-semibold text-red-800">Danger zone</h2>
        <p className="mt-1 text-sm text-red-700">
          Permanently remove your Supabase sign-in and Giggo profile, jobs, saved jobs, verification records, CV, and analysis history.
        </p>
        <div className="mt-4 space-y-3">
          <Input
            id="delete-password"
            label="Current password"
            type="password"
            autoComplete="current-password"
            value={deletePassword}
            onChange={(event) => setDeletePassword(event.target.value)}
            disabled={deleting}
          />
          <Input
            id="delete-confirmation"
            label="Type DELETE to confirm"
            value={deleteConfirmation}
            onChange={(event) => setDeleteConfirmation(event.target.value)}
            autoComplete="off"
            disabled={deleting}
          />
          <Button
            variant="danger"
            onClick={onDelete}
            loading={deleting}
            disabled={deleteConfirmation !== 'DELETE' || !deletePassword}
          >
            Permanently delete account
          </Button>
        </div>
      </section>
    </div>
  );
}
