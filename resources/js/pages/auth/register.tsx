import { Head, Link, useForm } from '@inertiajs/react';
import {
    Building2,
    Eye,
    EyeOff,
    LockKeyhole,
    Mail,
    MapPin,
    Phone,
    ShieldCheck,
    User,
    UserPlus,
} from 'lucide-react';
import { FormEvent, useState } from 'react';

export default function Register() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);

    const form = useForm({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        company_name: '',
        address: '',
        address_complement: '',
        postal_code: '',
        city: '',
        country: 'France',
        password: '',
        password_confirmation: '',
        terms: false,
    });

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        form.transform((data) => ({
            ...data,
            name: `${data.first_name} ${data.last_name}`.trim(),
        }));

        form.post('/register', {
            preserveScroll: true,
            onFinish: () => {
                form.reset('password', 'password_confirmation');
            },
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
                            Renseignez vos informations pour créer votre espace
                            client Astreon.
                        </p>
                    </div>
                </div>

                <form
                    onSubmit={submit}
                    className="astreon-auth-form astreon-register-form"
                >
                    <h2 className="astreon-register-section">
                        Vos informations
                    </h2>

                    <div className="astreon-register-grid">
                        <div className="astreon-register-field">
                            <label htmlFor="first_name">Prénom</label>
                            <div className="astreon-auth-input">
                                <User className="h-5 w-5" />
                                <input
                                    id="first_name"
                                    type="text"
                                    autoComplete="given-name"
                                    autoFocus
                                    required
                                    value={form.data.first_name}
                                    onChange={(event) =>
                                        form.setData(
                                            'first_name',
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Votre prénom"
                                />
                            </div>
                            {form.errors.first_name && (
                                <p className="astreon-auth-error">
                                    {form.errors.first_name}
                                </p>
                            )}
                        </div>

                        <div className="astreon-register-field">
                            <label htmlFor="last_name">Nom</label>
                            <div className="astreon-auth-input">
                                <User className="h-5 w-5" />
                                <input
                                    id="last_name"
                                    type="text"
                                    autoComplete="family-name"
                                    required
                                    value={form.data.last_name}
                                    onChange={(event) =>
                                        form.setData(
                                            'last_name',
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Votre nom"
                                />
                            </div>
                            {form.errors.last_name && (
                                <p className="astreon-auth-error">
                                    {form.errors.last_name}
                                </p>
                            )}
                        </div>

                        <div className="astreon-register-field">
                            <label htmlFor="email">Adresse e-mail</label>
                            <div className="astreon-auth-input">
                                <Mail className="h-5 w-5" />
                                <input
                                    id="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={form.data.email}
                                    onChange={(event) =>
                                        form.setData(
                                            'email',
                                            event.target.value,
                                        )
                                    }
                                    placeholder="vous@exemple.fr"
                                />
                            </div>
                            {form.errors.email && (
                                <p className="astreon-auth-error">
                                    {form.errors.email}
                                </p>
                            )}
                        </div>

                        <div className="astreon-register-field">
                            <label htmlFor="phone">Téléphone</label>
                            <div className="astreon-auth-input">
                                <Phone className="h-5 w-5" />
                                <input
                                    id="phone"
                                    type="tel"
                                    autoComplete="tel"
                                    required
                                    value={form.data.phone}
                                    onChange={(event) =>
                                        form.setData(
                                            'phone',
                                            event.target.value,
                                        )
                                    }
                                    placeholder="+33 6 12 34 56 78"
                                />
                            </div>
                            {form.errors.phone && (
                                <p className="astreon-auth-error">
                                    {form.errors.phone}
                                </p>
                            )}
                        </div>

                        <div className="astreon-register-field astreon-register-full">
                            <label htmlFor="company_name">
                                Entreprise{' '}
                                <span className="font-normal opacity-60">
                                    (facultatif)
                                </span>
                            </label>
                            <div className="astreon-auth-input">
                                <Building2 className="h-5 w-5" />
                                <input
                                    id="company_name"
                                    type="text"
                                    autoComplete="organization"
                                    value={form.data.company_name}
                                    onChange={(event) =>
                                        form.setData(
                                            'company_name',
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Nom de votre entreprise"
                                />
                            </div>
                            {form.errors.company_name && (
                                <p className="astreon-auth-error">
                                    {form.errors.company_name}
                                </p>
                            )}
                        </div>
                    </div>

                    <h2 className="astreon-register-section">
                        Adresse de facturation
                    </h2>

                    <div className="astreon-register-grid astreon-register-address-grid">
                        <div className="astreon-register-field astreon-register-full">
                            <label htmlFor="address">Adresse</label>
                            <div className="astreon-auth-input">
                                <MapPin className="h-5 w-5" />
                                <input
                                    id="address"
                                    type="text"
                                    autoComplete="address-line1"
                                    required
                                    value={form.data.address}
                                    onChange={(event) =>
                                        form.setData(
                                            'address',
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Numéro et nom de rue"
                                />
                            </div>
                            {form.errors.address && (
                                <p className="astreon-auth-error">
                                    {form.errors.address}
                                </p>
                            )}
                        </div>

                        <div className="astreon-register-field astreon-register-full">
                            <label htmlFor="address_complement">
                                Complément d’adresse{' '}
                                <span className="font-normal opacity-60">
                                    (facultatif)
                                </span>
                            </label>
                            <div className="astreon-auth-input">
                                <MapPin className="h-5 w-5" />
                                <input
                                    id="address_complement"
                                    type="text"
                                    autoComplete="address-line2"
                                    value={form.data.address_complement}
                                    onChange={(event) =>
                                        form.setData(
                                            'address_complement',
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Bâtiment, appartement, étage…"
                                />
                            </div>
                            {form.errors.address_complement && (
                                <p className="astreon-auth-error">
                                    {form.errors.address_complement}
                                </p>
                            )}
                        </div>

                        <div className="astreon-register-field astreon-register-address-field">
                            <label htmlFor="postal_code">Code postal</label>
                            <div className="astreon-auth-input">
                                <MapPin className="h-5 w-5" />
                                <input
                                id="postal_code"
                                type="text"
                                autoComplete="postal-code"
                                required
                                value={form.data.postal_code}
                                onChange={(event) =>
                                    form.setData(
                                        'postal_code',
                                        event.target.value,
                                    )
                                }
                                placeholder="75001"
                                />
                            </div>
                            {form.errors.postal_code && (
                                <p className="astreon-auth-error">
                                    {form.errors.postal_code}
                                </p>
                            )}
                        </div>

                        <div className="astreon-register-field astreon-register-address-field">
                            <label htmlFor="city">Ville</label>
                            <div className="astreon-auth-input">
                                <MapPin className="h-5 w-5" />
                                <input
                                id="city"
                                type="text"
                                autoComplete="address-level2"
                                required
                                value={form.data.city}
                                onChange={(event) =>
                                    form.setData('city', event.target.value)
                                }
                                placeholder="Paris"
                                />
                            </div>
                            {form.errors.city && (
                                <p className="astreon-auth-error">
                                    {form.errors.city}
                                </p>
                            )}
                        </div>

                        <div className="astreon-register-field astreon-register-address-field">
                            <label htmlFor="country">Pays</label>
                            <div className="astreon-auth-input">
                                <MapPin className="h-5 w-5" />
                                <input
                                id="country"
                                type="text"
                                autoComplete="country-name"
                                required
                                value={form.data.country}
                                onChange={(event) =>
                                    form.setData(
                                        'country',
                                        event.target.value,
                                    )
                                }
                                placeholder="France"
                                />
                            </div>
                            {form.errors.country && (
                                <p className="astreon-auth-error">
                                    {form.errors.country}
                                </p>
                            )}
                        </div>
                    </div>

                    <h2 className="astreon-register-section">
                        Sécurité du compte
                    </h2>

                    <div className="astreon-register-grid">
                        <div className="astreon-register-field">
                            <label htmlFor="password">Mot de passe</label>
                            <div className="astreon-auth-input">
                                <LockKeyhole className="h-5 w-5" />
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="new-password"
                                    required
                                    value={form.data.password}
                                    onChange={(event) =>
                                        form.setData(
                                            'password',
                                            event.target.value,
                                        )
                                    }
                                    placeholder="8 caractères minimum"
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword((visible) => !visible)
                                    }
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
                        </div>

                        <div className="astreon-register-field">
                            <label htmlFor="password_confirmation">
                                Confirmer le mot de passe
                            </label>
                            <div className="astreon-auth-input">
                                <LockKeyhole className="h-5 w-5" />
                                <input
                                    id="password_confirmation"
                                    type={
                                        showConfirmation ? 'text' : 'password'
                                    }
                                    autoComplete="new-password"
                                    required
                                    value={form.data.password_confirmation}
                                    onChange={(event) =>
                                        form.setData(
                                            'password_confirmation',
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Saisissez à nouveau le mot de passe"
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowConfirmation(
                                            (visible) => !visible,
                                        )
                                    }
                                    aria-label={
                                        showConfirmation
                                            ? 'Masquer la confirmation du mot de passe'
                                            : 'Afficher la confirmation du mot de passe'
                                    }
                                >
                                    {showConfirmation ? (
                                        <EyeOff className="h-5 w-5" />
                                    ) : (
                                        <Eye className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                            {form.errors.password_confirmation && (
                                <p className="astreon-auth-error">
                                    {form.errors.password_confirmation}
                                </p>
                            )}
                        </div>
                    </div>

                    <label className="astreon-auth-check astreon-register-full">
                        <input
                            type="checkbox"
                            checked={form.data.terms}
                            onChange={(event) =>
                                form.setData('terms', event.target.checked)
                            }
                            required
                        />
                        <span>
                            J’accepte les{' '}
                            <Link href="/conditions">
                                conditions d’utilisation
                            </Link>{' '}
                            et la politique de confidentialité.
                        </span>
                    </label>

                    {form.errors.terms && (
                        <p className="astreon-auth-error astreon-register-full">
                            {form.errors.terms}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={form.processing}
                        className="astreon-auth-submit astreon-register-full"
                    >
                        <ShieldCheck className="h-5 w-5" />
                        {form.processing
                            ? 'Création du compte…'
                            : 'Créer mon compte'}
                    </button>
                </form>

                <div className="astreon-auth-login-link">
                    Déjà inscrit ? <Link href="/login">Se connecter</Link>
                </div>
            </div>

            <style>{`
                

                .astreon-register-form {
                    display: grid;
                    grid-template-columns: minmax(0, 1fr);
                    gap: 12px;
                }

                .astreon-register-grid {
                    display: grid;
                    grid-template-columns: repeat(2, minmax(0, 1fr));
                    gap: 12px 16px;
                }

                .astreon-register-address-grid {
                    grid-template-columns: repeat(6, minmax(0, 1fr));
                }

                .astreon-register-address-field {
                    grid-column: span 2;
                }

                .astreon-register-field {
                    min-width: 0;
                }

                .astreon-register-field > label {
                    display: block;
                    margin-bottom: 5px;
                }

                .astreon-register-field .astreon-auth-input {
                    min-width: 0;
                    min-height: 40px;
                }

                .astreon-register-field .astreon-auth-input select,
                .astreon-register-field .astreon-auth-input input {
                    height: 40px;
                    color: #fff;
                    appearance: none;
                }

                .astreon-register-field input {
                    min-width: 0;
                    width: 100%;
                    box-sizing: border-box;
                }

                .astreon-register-section {
                    grid-column: 1 / -1;
                    margin: 4px 0 0;
                    color: white;
                    font-size: 14px;
                    font-weight: 700;
                }

                .astreon-register-full {
                    grid-column: 1 / -1;
                }

                .astreon-register-form .astreon-auth-submit {
                    width: 100%;
                }

                    .astreon-register-grid,
                    .astreon-register-address-grid {
                        grid-template-columns: minmax(0, 1fr);
                        gap: 10px;
                    }

                    .astreon-register-address-field {
                        grid-column: 1 / -1;
                    }
                }
            `}</style>
        </>
    );
};