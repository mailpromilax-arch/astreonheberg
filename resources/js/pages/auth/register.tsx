import { Head, Link, useForm } from '@inertiajs/react';
import {
    Eye,
    EyeOff,
    LockKeyhole,
    Mail,
    ShieldCheck,
    User,
    UserPlus,
} from 'lucide-react';
import { FormEvent, useState } from 'react';

export default function Register() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);

    const form = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        terms: false,
    });

    const submit = (event: FormEvent) => {
        event.preventDefault();

        form.post('/register', {
            preserveScroll: true,
            onFinish: () =>
                form.reset('password', 'password_confirmation'),
        });
    };

    return (
        <>
            <Head title="Créer un compte — Astreon" />

            <div className="astreon-auth-card astreon-register-card">
                <div className="astreon-auth-heading">
                    <span className="astreon-auth-icon">
                        <UserPlus className="h-6 w-6" />
                    </span>

                    <div>
                        <h1>Créer votre compte</h1>
                        <p>
                            Inscrivez-vous pour commander et gérer vos
                            services Astreon.
                        </p>
                    </div>
                </div>

                <form onSubmit={submit} className="astreon-auth-form">
                    <div className="astreon-register-grid">
                        <div>
                            <label htmlFor="name">Nom complet</label>

                            <div className="astreon-auth-input">
                                <User className="h-5 w-5" />
                                <input
                                    id="name"
                                    type="text"
                                    value={form.data.name}
                                    onChange={(event) =>
                                        form.setData(
                                            'name',
                                            event.target.value,
                                        )
                                    }
                                    autoComplete="name"
                                    autoFocus
                                    required
                                    placeholder="Prénom et nom"
                                />
                            </div>

                            {form.errors.name && (
                                <p className="astreon-auth-error">
                                    {form.errors.name}
                                </p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="email">Adresse courriel</label>

                            <div className="astreon-auth-input">
                                <Mail className="h-5 w-5" />
                                <input
                                    id="email"
                                    type="email"
                                    value={form.data.email}
                                    onChange={(event) =>
                                        form.setData(
                                            'email',
                                            event.target.value,
                                        )
                                    }
                                    autoComplete="email"
                                    required
                                    placeholder="vous@exemple.fr"
                                />
                            </div>

                            {form.errors.email && (
                                <p className="astreon-auth-error">
                                    {form.errors.email}
                                </p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="password">Mot de passe</label>

                            <div className="astreon-auth-input">
                                <LockKeyhole className="h-5 w-5" />
                                <input
                                    id="password"
                                    type={
                                        showPassword ? 'text' : 'password'
                                    }
                                    value={form.data.password}
                                    onChange={(event) =>
                                        form.setData(
                                            'password',
                                            event.target.value,
                                        )
                                    }
                                    autoComplete="new-password"
                                    required
                                    placeholder="8 caractères minimum"
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
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
                        </div>

                        <div>
                            <label htmlFor="password_confirmation">
                                Confirmer le mot de passe
                            </label>

                            <div className="astreon-auth-input">
                                <ShieldCheck className="h-5 w-5" />
                                <input
                                    id="password_confirmation"
                                    type={
                                        showConfirmation
                                            ? 'text'
                                            : 'password'
                                    }
                                    value={
                                        form.data.password_confirmation
                                    }
                                    onChange={(event) =>
                                        form.setData(
                                            'password_confirmation',
                                            event.target.value,
                                        )
                                    }
                                    autoComplete="new-password"
                                    required
                                    placeholder="Répétez le mot de passe"
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowConfirmation(
                                            !showConfirmation,
                                        )
                                    }
                                >
                                    {showConfirmation ? (
                                        <EyeOff className="h-5 w-5" />
                                    ) : (
                                        <Eye className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    <label className="astreon-auth-check">
                        <input
                            type="checkbox"
                            checked={form.data.terms}
                            onChange={(event) =>
                                form.setData(
                                    'terms',
                                    event.target.checked,
                                )
                            }
                            required
                        />

                        <span>
                            J’accepte les{' '}
                            <Link href="/conditions">
                                conditions d’utilisation
                            </Link>
                            .
                        </span>
                    </label>

                    {form.errors.terms && (
                        <p className="astreon-auth-error">
                            {form.errors.terms}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={form.processing}
                        className="astreon-auth-submit"
                    >
                        <UserPlus className="h-5 w-5" />
                        {form.processing
                            ? 'Création du compte...'
                            : 'Créer mon compte'}
                    </button>
                </form>

                <div className="astreon-auth-login-link">
                    Déjà inscrit ?{' '}
                    <Link href="/login">Se connecter</Link>
                </div>
            </div>
        </>
    );
}

Register.layout = {
    title: 'Créer un compte',
    description:
        'Créez votre compte Astreon et accédez à tous vos services.',
};
