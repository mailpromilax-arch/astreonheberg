<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    >
    <title>{{ $title ?? 'Astreon' }}</title>
</head>

<body style="margin:0;padding:0;background-color:#080611;color:#ffffff;font-family:Arial,Helvetica,sans-serif;">

<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
    {{ $preheader ?? '' }}
</div>

<table
    role="presentation"
    width="100%"
    cellspacing="0"
    cellpadding="0"
    border="0"
    style="width:100%;background-color:#080611;"
>
    <tr>
        <td align="center" style="padding:32px 12px;">

            <table
                role="presentation"
                width="100%"
                cellspacing="0"
                cellpadding="0"
                border="0"
                style="width:100%;max-width:640px;"
            >
                <tr>
                    <td style="padding:0 8px 22px 8px;">
                        <div style="font-size:25px;font-weight:900;letter-spacing:2px;color:#ffffff;">
                            <span style="color:#a855f7;">A</span>STREON
                        </div>

                        <div style="margin-top:4px;font-size:10px;font-weight:700;letter-spacing:4px;color:#a78bfa;">
                            HÉBERGEMENT &amp; SERVICES
                        </div>
                    </td>
                </tr>

                <tr>
                    <td
                        style="
                            border:1px solid #33204f;
                            border-radius:22px;
                            background-color:#120d21;
                            overflow:hidden;
                        "
                    >
                        <div
                            style="
                                height:5px;
                                background-color:#9333ea;
                                background-image:linear-gradient(
                                    90deg,
                                    #7c3aed,
                                    #c026d3,
                                    #7c3aed
                                );
                            "
                        ></div>

                        <table
                            role="presentation"
                            width="100%"
                            cellspacing="0"
                            cellpadding="0"
                            border="0"
                        >
                            <tr>
                                <td style="padding:38px 38px 16px 38px;">
                                    <div
                                        style="
                                            font-size:11px;
                                            font-weight:800;
                                            letter-spacing:3px;
                                            color:#c084fc;
                                        "
                                    >
                                        {{ $eyebrow ?? 'ASTREON' }}
                                    </div>

                                    <h1
                                        style="
                                            margin:14px 0 0 0;
                                            font-size:31px;
                                            line-height:1.2;
                                            color:#ffffff;
                                        "
                                    >
                                        {{ $title ?? 'Information Astreon' }}
                                    </h1>
                                </td>
                            </tr>

                            <tr>
                                <td style="padding:10px 38px 38px 38px;">
                                    <p
                                        style="
                                            margin:0 0 18px 0;
                                            font-size:16px;
                                            font-weight:700;
                                            line-height:1.7;
                                            color:#f8fafc;
                                        "
                                    >
                                        {{ $greeting ?? 'Bonjour,' }}
                                    </p>

                                    @if (!empty($intro))
                                        <p
                                            style="
                                                margin:0 0 18px 0;
                                                font-size:15px;
                                                line-height:1.75;
                                                color:#cbd5e1;
                                            "
                                        >
                                            {{ $intro }}
                                        </p>
                                    @endif

                                    @foreach (($paragraphs ?? []) as $paragraph)
                                        <p
                                            style="
                                                margin:0 0 18px 0;
                                                font-size:15px;
                                                line-height:1.75;
                                                color:#aeb7c6;
                                            "
                                        >
                                            {{ $paragraph }}
                                        </p>
                                    @endforeach

                                    @if (!empty($actionUrl) && !empty($actionLabel))
                                        <table
                                            role="presentation"
                                            cellspacing="0"
                                            cellpadding="0"
                                            border="0"
                                            style="margin:28px 0;"
                                        >
                                            <tr>
                                                <td
                                                    align="center"
                                                    style="
                                                        border-radius:12px;
                                                        background-color:#9333ea;
                                                    "
                                                >
                                                    <a
                                                        href="{{ $actionUrl }}"
                                                        style="
                                                            display:inline-block;
                                                            padding:15px 24px;
                                                            color:#ffffff;
                                                            text-decoration:none;
                                                            font-size:15px;
                                                            font-weight:800;
                                                            border-radius:12px;
                                                            background-color:#9333ea;
                                                        "
                                                    >
                                                        {{ $actionLabel }}
                                                    </a>
                                                </td>
                                            </tr>
                                        </table>
                                    @endif

                                    @if (!empty($actionUrl))
                                        <div
                                            style="
                                                margin:0 0 24px 0;
                                                padding:14px 16px;
                                                border-radius:12px;
                                                background-color:#0b0813;
                                                border:1px solid #2a1a40;
                                            "
                                        >
                                            <div
                                                style="
                                                    font-size:12px;
                                                    line-height:1.6;
                                                    color:#7d8798;
                                                "
                                            >
                                                Si le bouton ne fonctionne pas,
                                                copiez ce lien dans votre navigateur :
                                            </div>

                                            <div
                                                style="
                                                    margin-top:7px;
                                                    word-break:break-all;
                                                    font-size:12px;
                                                    line-height:1.6;
                                                    color:#c084fc;
                                                "
                                            >
                                                {{ $actionUrl }}
                                            </div>
                                        </div>
                                    @endif


                                    @if (!empty($details))
                                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
                                               style="margin:0 0 24px 0;border-collapse:separate;border-spacing:0;border:1px solid #33204f;border-radius:12px;background-color:#0b0813;">
                                            @foreach ($details as $detailLabel => $detailValue)
                                                <tr>
                                                    <td style="padding:11px 14px;border-bottom:1px solid #241737;font-size:12px;font-weight:700;color:#8b95a7;">
                                                        {{ $detailLabel }}
                                                    </td>
                                                    <td align="right" style="padding:11px 14px;border-bottom:1px solid #241737;font-size:12px;font-weight:800;color:#f8fafc;">
                                                        {{ $detailValue }}
                                                    </td>
                                                </tr>
                                            @endforeach
                                        </table>
                                    @endif

                                    @if (!empty($notice))
                                        <div
                                            style="
                                                padding:16px 18px;
                                                border-left:4px solid #a855f7;
                                                border-radius:10px;
                                                background-color:#191027;
                                                font-size:13px;
                                                line-height:1.7;
                                                color:#cbd5e1;
                                            "
                                        >
                                            {{ $notice }}
                                        </div>
                                    @endif
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>

                <tr>
                    <td
                        style="
                            padding:24px 16px 0 16px;
                            text-align:center;
                        "
                    >
                        <p
                            style="
                                margin:0;
                                font-size:12px;
                                line-height:1.7;
                                color:#687386;
                            "
                        >
                            {{ $footerText ?? 'E-mail automatique Astreon.' }}
                        </p>

                        <p
                            style="
                                margin:9px 0 0 0;
                                font-size:11px;
                                line-height:1.7;
                                color:#4b5563;
                            "
                        >
                            © {{ date('Y') }} Astreon. Tous droits réservés.
                            <br>
                            Ne répondez pas à cet e-mail automatique.
                        </p>
                    </td>
                </tr>
            </table>

        </td>
    </tr>
</table>

</body>
</html>
