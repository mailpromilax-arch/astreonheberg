import { Head, Link, useForm } from '@inertiajs/react';
import { Eye, EyeOff, LockKeyhole, LogIn, Mail, UserPlus } from 'lucide-react';
import { FormEvent, useState } from 'react';

type Props = {
    status?: string;
    canResetPassword?: boolean;
    canResetMotDePasse?: boolean;
};

export default function Login({
    status,
    canResetPassword = true,
    canResetMotDePasse = true,
}: Props) {
    const [showPassword, setShowPassword] = useState(false);

    const form = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (event: FormEvent) => {
        event.preventDefault();

        form.post('/login', {
            preserveScroll: true,
            onFinish: () => form.reset('password'),
        });
    };

    const canReset = canResetPassword || canResetMotDePasse;

    return (
        <>
            <Head title="Connexion — Astreon" />

            <div className="astreon-auth-card">
                <div className="astreon-auth-heading">
                    <span className="astreon-auth-icon">
                        <LogIn className="h-6 w-6" />
                    </span>

                    <div>
                        <h1>Connexion</h1>
                        <p>Accédez à votre espace client Astreon.</p>
                    </div>
                </div>

                {status && (
                    <div className="astreon-auth-success">{status}</div>
                )}

                <form onSubmit={submit} className="astreon-auth-form">
                    <label htmlFor="email">Adresse courriel</label>

                    <div className="astreon-auth-input">
                        <Mail className="h-5 w-5" />
                        <input
                            id="email"
                            type="email"
                            value={form.data.email}
                            onChange={(event) =>
                                form.setData('email', event.target.value)
                            }
                            autoComplete="email"
                            autoFocus
                            required
                            placeholder="vous@exemple.fr"
                        />
                    </div>

                    {form.errors.email && (
                        <p className="astreon-auth-error">
                            {form.errors.email}
                        </p>
                    )}

                    <div className="astreon-auth-label-row">
                        <label htmlFor="password">Mot de passe</label>

                        {canReset && (
                            <Link href="/forgot-password">
                                Mot de passe oublié ?
                            </Link>
                        )}
                    </div>

                    <div className="astreon-auth-input">
                        <LockKeyhole className="h-5 w-5" />
                        <input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            value={form.data.password}
                            onChange={(event) =>
                                form.setData('password', event.target.value)
                            }
                            autoComplete="current-password"
                            required
                            placeholder="Votre mot de passe"
                        />

                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label={
                                showPassword
                                    ? 'Masquer le mot de passe'
                                    : 'Afficher le mot de passe'
                            }
                        >
                            {showPassword ? (
                                <EyeOff className="h-5 w-5" />
                            ) : (
                                <Eye className="h-5 w-5" />
                            )}
                        </button>
                    </div>

                    {form.errors.password && (
                        <p className="astreon-auth-error">
                            {form.errors.password}
                        </p>
                    )}

                    <label className="astreon-auth-check">
                        <input
                            type="checkbox"
                            checked={form.data.remember}
                            onChange={(event) =>
                                form.setData('remember', event.target.checked)
                            }
                        />
                        <span>Rester connecté</span>
                    </label>

                    <button
                        type="submit"
                        disabled={form.processing}
                        className="astreon-auth-submit"
                    >
                        <LogIn className="h-5 w-5" />
                        {form.processing
                            ? 'Connexion en cours...'
                            : 'Se connecter'}
                    </button>
                </form>

                <div className="astreon-auth-register">
                    <div>
                        <strong>Nouveau chez Astreon ?</strong>
                        <span>
                            Créez votre compte client gratuitement.
                        </span>
                    </div>

                    <Link href="/register">
                        <UserPlus className="h-5 w-5" />
                        Créer un compte
                    </Link>
                </div>
            </div>
        </>
    );
}

Login.layout = {
    title: 'Connexion',
    description: 'Connectez-vous à votre compte Astreon pour continuer.',
};
