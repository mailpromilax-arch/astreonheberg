import { Head, router } from '@inertiajs/react';
import PublicLayout from '@/layouts/PublicLayout';

const plans = [
    {
        id: 25, // Remplacer par l'ID réel de Web Start
        name: 'Web Start',
        code: 'WEB-START',
        price: '1,99',
        logo: 'browser.svg',
        features: [
            ['storage.svg', 'Stockage', '5 Go NVMe'],
            ['database.svg', 'Bases de données', '2'],
            ['backup.svg', 'Sauvegardes', '1'],
        ],
        extras: [
            ['lock.svg', 'Certificat SSL inclus'],
            ['shield.svg', 'Protection anti-DDoS'],
            ['mail.svg', 'Adresse e-mail incluse'],
            ['support.svg', 'Support standard'],
        ],
    },
    {
        id: 26,
        name: 'Web Plus',
        code: 'WEB-PLUS',
        price: '3,99',
        logo: 'browser-plus.svg',
        features: [
            ['storage.svg', 'Stockage', '15 Go NVMe'],
            ['database.svg', 'Bases de données', '10'],
            ['backup.svg', 'Sauvegardes', '2'],
        ],
        extras: [
            ['lock.svg', 'Certificat SSL inclus'],
            ['shield.svg', 'Protection anti-DDoS'],
            ['mail.svg', 'Adresses e-mail incluses'],
            ['support.svg', 'Support prioritaire'],
        ],
    },
    {
        id: 27,
        name: 'Web Pro',
        code: 'WEB-PRO',
        price: '6,99',
        logo: 'browser-settings.svg',
        popular: true,
        features: [
            ['storage.svg', 'Stockage', '40 Go NVMe'],
            ['database.svg', 'Bases de données', '50'],
            ['backup.svg', 'Sauvegardes', '4'],
        ],
        extras: [
            ['lock.svg', 'Certificat SSL inclus'],
            ['shield.svg', 'Protection anti-DDoS'],
            ['mail.svg', 'Adresses e-mail incluses'],
            ['support.svg', 'Support prioritaire'],
        ],
    },
    {
        id: 28,
        name: 'Web Agency',
        code: 'WEB-AGENCY',
        price: '12,99',
        logo: 'panel.svg',
        features: [
            ['storage.svg', 'Stockage', '100 Go NVMe'],
            ['database.svg', 'Bases de données', '100'],
            ['backup.svg', 'Sauvegardes', '7'],
        ],
        extras: [
            ['lock.svg', 'Certificat SSL inclus'],
            ['shield.svg', 'Protection anti-DDoS'],
            ['mail.svg', 'Adresses e-mail incluses'],
            ['support.svg', 'Support prioritaire'],
        ],
    },
];

export default function WebHosting() {
    return (
        <PublicLayout>
            <Head title="Hébergement Web — Astreon" />

            <main className="web-hosting">
                <style>{`
                    .web-hosting,
                    .web-hosting * {
                        box-sizing: border-box;
                    }

                    .web-hosting {
                        position: relative;
                        isolation: isolate;
                        min-height: 700px;
                        overflow: hidden;
                        padding: 88px 24px 72px;
                        color: #f8f7ff;
                        background: url('/images/astreon/fondweb.png') center / cover no-repeat;
                        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
                    }

                    .web-hosting::before {
                        position: absolute;
                        z-index: -1;
                        inset: 0;
                        content: "";
                        pointer-events: none;
                        opacity: .35;
                        background-image: radial-gradient(rgba(205, 190, 255, .75) .7px, transparent .7px);
                        background-size: 72px 72px;
                        mask-image: linear-gradient(to bottom, transparent, black 20%, black 80%, transparent);
                    }

                    .web-container {
                        width: min(100%, 1120px);
                        margin: 0 auto;
                    }

                    /* Le header global applique un fond sombre aux <header> génériques.
                       Cette page réutilise le correctif transparent des autres pages. */
                    .web-hosting .web-heading,
                    .web-hosting .web-heading.univers-header-transparent {
                        background: transparent !important;
                        background-color: transparent !important;
                        background-image: none !important;
                        backdrop-filter: none !important;
                        -webkit-backdrop-filter: none !important;
                        box-shadow: none !important;
                        border: none !important;
                    }

                    .web-heading {
                        position: relative;
                        isolation: isolate;
                        max-width: 760px;
                        margin: 0 auto 52px;
                        padding: 0 18px;
                        text-align: center;
                        background: transparent;
                    }

                    .web-heading::before {
                        position: absolute;
                        z-index: -1;
                        top: 18%;
                        left: 50%;
                        width: min(620px, 90vw);
                        height: 180px;
                        content: "";
                        transform: translateX(-50%);
                        border-radius: 50%;
                        background: radial-gradient(ellipse, rgba(103, 56, 221, .2), transparent 70%);
                        filter: blur(12px);
                        pointer-events: none;
                    }

                    .web-kicker {
                        display: inline-flex;
                        align-items: center;
                        gap: 8px;
                        margin: 0 0 16px;
                        color: #a98cff;
                        font-size: 10px;
                        font-weight: 800;
                        letter-spacing: .38em;
                        text-transform: uppercase;
                    }

                    .web-heading h1 {
                        margin: 0;
                        color: #fff;
                        font-size: clamp(38px, 5vw, 58px);
                        font-weight: 800;
                        letter-spacing: -.045em;
                        line-height: 1.08;
                    }

                    .web-heading p {
                        max-width: 620px;
                        margin: 16px auto 0;
                        color: #aaa5bc;
                        font-size: 15px;
                        line-height: 1.7;
                    }

                    .web-benefits {
                        display: flex;
                        justify-content: center;
                        flex-wrap: wrap;
                        gap: 18px 34px;
                        margin: 0 auto 36px;
                        color: #d7d0ed;
                        font-size: 12px;
                    }

                    .web-benefits span {
                        display: inline-flex;
                        align-items: center;
                        gap: 9px;
                    }

                    .web-benefits img,
                    .web-note img,
                    .web-choose img,
                    .web-kicker img {
                        display: block;
                        flex: 0 0 auto;
                    }

                    .web-benefits img,
                    .web-note img,
                    .web-kicker img {
                        filter: drop-shadow(0 0 7px rgba(217, 70, 255, .28));
                    }

                    .web-benefits i {
                        color: #a98cff;
                        font-size: 16px;
                        font-style: normal;
                    }

                    .web-grid {
                        display: grid;
                        grid-template-columns: repeat(4, minmax(0, 1fr));
                        gap: 22px;
                        align-items: stretch;
                    }

                    /* Les <section> génériques reçoivent un fond sombre global (app.css).
                       On force la transparence sur le conteneur de la grille et les blocs autour. */
                    .web-hosting .web-container,
                    .web-hosting .web-grid,
                    .web-hosting .web-benefits,
                    .web-hosting .web-note {
                        background: transparent !important;
                        background-color: transparent !important;
                        background-image: none !important;
                        backdrop-filter: none !important;
                        -webkit-backdrop-filter: none !important;
                        box-shadow: none !important;
                        border: none !important;
                    }

                    .web-card {
                        position: relative;
                        display: flex;
                        flex-direction: column;
                        min-height: 418px;
                        padding: 26px 22px 21px;
                        overflow: visible;
                        border: 1px solid rgba(151, 113, 255, .3);
                        border-radius: 18px;
                        background: linear-gradient(155deg, rgba(27, 20, 52, .97), rgba(12, 10, 27, .97));
                        box-shadow: 0 16px 45px rgba(0, 0, 0, .2);
                        transition: transform .25s ease, border-color .25s ease, box-shadow .25s ease, background .25s ease;
                    }

                    .web-card:hover {
                        transform: translateY(-5px);
                        border-color: rgba(174, 137, 255, .8);
                        background: linear-gradient(155deg, rgba(37, 26, 72, .98), rgba(14, 11, 31, .98));
                        box-shadow: 0 24px 65px rgba(72, 37, 156, .3);
                    }

                    .web-card-popular {
                        border-color: #945fff;
                        box-shadow: 0 0 30px rgba(121, 74, 255, .16);
                    }

                    .web-popular {
                        position: absolute;
                        top: -12px;
                        left: 50%;
                        padding: 5px 14px;
                        transform: translateX(-50%);
                        border: 1px solid rgba(255,255,255,.18);
                        border-radius: 99px;
                        background: linear-gradient(90deg, #7138f4, #b64cff);
                        box-shadow: 0 7px 18px rgba(113, 56, 244, .3);
                        color: white;
                        font-size: 9px;
                        font-weight: 800;
                        letter-spacing: .09em;
                        white-space: nowrap;
                    }

                    .web-card-top {
                        display: flex;
                        align-items: center;
                        gap: 14px;
                        margin-bottom: 18px;
                    }

                    .web-logo {
                        display: grid;
                        flex: 0 0 auto;
                        width: 46px;
                        height: 46px;
                        place-items: center;
                        border: 1px solid rgba(165, 132, 255, .27);
                        border-radius: 13px;
                        background: rgba(128, 85, 255, .12);
                    }

                    .web-logo img {
                        display: block;
                        width: 28px;
                        height: 28px;
                        filter: drop-shadow(0 0 8px rgba(217, 70, 255, .35));
                    }

                    .web-card h2 {
                        margin: 0;
                        color: #fff;
                        font-size: 21px;
                        font-weight: 750;
                        line-height: 1.15;
                    }

                    .web-code {
                        display: block;
                        margin-top: 5px;
                        color: #9fb4ff;
                        font-size: 9px;
                        font-weight: 700;
                        letter-spacing: .18em;
                    }

                    .web-price {
                        display: flex;
                        align-items: baseline;
                        gap: 7px;
                        margin-bottom: 18px;
                    }

                    .web-price strong {
                        color: #fff;
                        font-size: 33px;
                        font-weight: 800;
                        letter-spacing: -.05em;
                    }

                    .web-price span {
                        color: #aaa4bd;
                        font-size: 12px;
                    }

                    .web-specs {
                        display: grid;
                        gap: 0;
                        margin: 0;
                        padding: 11px 0;
                        border-top: 1px solid rgba(177, 155, 255, .16);
                        border-bottom: 1px solid rgba(177, 155, 255, .16);
                        list-style: none;
                    }

                    .web-specs li {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        gap: 10px;
                        padding: 7px 0;
                        color: #c7c1d6;
                        font-size: 12px;
                    }

                    .web-spec-label {
                        display: inline-flex;
                        align-items: center;
                        gap: 9px;
                    }

                    .web-spec-label img {
                        display: block;
                        width: 16px;
                        height: 16px;
                        opacity: .9;
                    }

                    .web-specs b {
                        color: #f3efff;
                        font-weight: 700;
                        text-align: right;
                    }

                    .web-extras {
                        display: grid;
                        gap: 10px;
                        margin: 16px 0 20px;
                        padding: 0;
                        list-style: none;
                    }

                    .web-extras li {
                        display: flex;
                        align-items: center;
                        gap: 9px;
                        color: #d4cfe0;
                        font-size: 11px;
                        line-height: 1.4;
                    }

                    .web-extras li img {
                        display: block;
                        flex: 0 0 auto;
                        width: 15px;
                        height: 15px;
                        opacity: .9;
                    }

                    .web-choose {
                        display: flex;
                        min-height: 42px;
                        align-items: center;
                        justify-content: center;
                        gap: 8px;
                        margin-top: auto;
                        border: 1px solid rgba(191, 163, 255, .2);
                        border-radius: 8px;
                        background: linear-gradient(100deg, #7138ef, #9b40ff);
                        box-shadow: 0 7px 20px rgba(113, 56, 239, .22);
                        color: #fff;
                        font-size: 11px;
                        font-weight: 800;
                        text-decoration: none;
                        cursor: pointer;
                        transition: filter .2s ease, transform .2s ease;
                    }

                    .web-choose:hover {
                        transform: translateY(-1px);
                        filter: brightness(1.13);
                    }

                    .web-note {
                        margin: 34px 0 0;
                        color: #9690a9;
                        font-size: 11px;
                        line-height: 1.7;
                        text-align: center;
                    }

                    .web-note span {
                        margin-right: 7px;
                        color: #a98cff;
                    }

                    @media (max-width: 900px) {
                        .web-hosting {
                            padding-top: 66px;
                        }

                        .web-grid {
                            grid-template-columns: repeat(2, minmax(0, 1fr));
                            gap: 18px;
                        }
                    }

                    @media (max-width: 560px) {
                        .web-hosting {
                            padding: 48px 18px;
                        }

                        .web-heading {
                            margin-bottom: 32px;
                        }

                        .web-heading h1 {
                            font-size: 38px;
                        }

                        .web-heading p {
                            font-size: 13px;
                        }

                        .web-benefits {
                            justify-content: flex-start;
                            gap: 12px 18px;
                            margin-bottom: 30px;
                            font-size: 11px;
                        }

                        .web-grid {
                            grid-template-columns: 1fr;
                            gap: 20px;
                        }

                        .web-card {
                            min-height: 0;
                            padding: 23px 21px 20px;
                        }
                    }
                `}</style>

                <div className="web-container">
                    <header className="web-heading univers-header-transparent">
                        <p className="web-kicker">
                            <img src="/images/astreon/lightning.svg" alt="" width="16" height="16" />
                            Astreon · Hébergement Web
                        </p>
                        <h1>Hébergement Web</h1>
                        <p>
                            Des sites rapides, sécurisés et toujours disponibles.
                            Choisissez l’offre adaptée à votre projet.
                        </p>
                    </header>

                    <div className="web-benefits">
                        <span><img src="/images/astreon/lightning.svg" alt="" width="18" height="18" /> Performances NVMe</span>
                        <span><img src="/images/astreon/lock.svg" alt="" width="18" height="18" /> Certificat SSL</span>
                        <span><img src="/images/astreon/backup.svg" alt="" width="18" height="18" /> Sauvegardes automatiques</span>
                    </div>

                    <section className="web-grid" aria-label="Offres d'hébergement web">
                        {plans.map((plan) => (
                            <article
                                className={`web-card${'popular' in plan && plan.popular ? ' web-card-popular' : ''}`}
                                key={plan.name}
                            >
                                {'popular' in plan && plan.popular && (
                                    <span className="web-popular">POPULAIRE</span>
                                )}

                                <div className="web-card-top">
                                    <div className="web-logo" aria-hidden="true">
                                        <img src={`/images/astreon/${plan.logo}`} alt="" width="28" height="28" />
                                    </div>
                                    <div>
                                        <h2>{plan.name}</h2>
                                        <span className="web-code">{plan.code}</span>
                                    </div>
                                </div>

                                <div className="web-price">
                                    <strong>{plan.price} €</strong>
                                    <span>/ mois</span>
                                </div>

                                <ul className="web-specs">
                                    {plan.features.map(([icon, label, value]) => (
                                        <li key={label}>
                                            <span className="web-spec-label">
                                                <img src={`/images/astreon/${icon}`} alt="" width="16" height="16" />
                                                {label}
                                            </span>
                                            <b>{value}</b>
                                        </li>
                                    ))}
                                </ul>

                                <ul className="web-extras">
                                    {plan.extras.map(([icon, label]) => (
                                        <li key={label}>
                                            <img src={`/images/astreon/${icon}`} alt="" width="15" height="15" />
                                            {label}
                                        </li>
                                    ))}
                                </ul>

                                <button
                                    className="web-choose"
                                    type="button"
                                    onClick={() =>
                                        router.post(`/panier/${plan.id}`, { quantity: 1 }, {
                                            preserveScroll: true,
                                        })
                                    }
                                >
                                    <img src="/images/astreon/cart.svg" alt="" width="18" height="18" /> Ajouter au panier
                                </button>
                            </article>
                        ))}
                    </section>

                    <p className="web-note">
                        <img src="/images/astreon/shield.svg" alt="" width="16" height="16" />
                        Tous nos hébergements sont sécurisés et protégés contre les attaques.
                    </p>
                </div>
            </main>
        </PublicLayout>
    );
}