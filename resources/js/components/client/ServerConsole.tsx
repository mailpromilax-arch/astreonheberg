import {
    FormEvent,
    useEffect,
    useRef,
    useState,
} from 'react';

type Props = {
    lines: string[];
    socketState: string;
    serverState: string;
    onSendCommand: (command: string) => void;
    onClear: () => void;
};

const timeNow = (): string =>
    new Intl.DateTimeFormat('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    }).format(new Date());

export default function ServerConsole({
    lines,
    socketState,
    onSendCommand,
    onClear,
}: Props) {
    const [command, setCommand] = useState('');
    const [copied, setCopied] = useState(false);
    const consoleRef = useRef<HTMLDivElement | null>(null);

    const connected = socketState === 'Connecté';

    useEffect(() => {
        const element = consoleRef.current;

        if (element) {
            element.scrollTop = element.scrollHeight;
        }
    }, [lines]);

    const submit = (event: FormEvent) => {
        event.preventDefault();

        const value = command.trim();

        if (value === '') {
            return;
        }

        onSendCommand(value);
        setCommand('');
    };

    const copyLogs = async () => {
        try {
            await navigator.clipboard.writeText(lines.join('\n'));
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1800);
        } catch {
            // Le téléchargement reste disponible si le presse-papiers est bloqué.
        }
    };

    const downloadLogs = () => {
        const blob = new Blob([lines.join('\n')], {
            type: 'text/plain;charset=utf-8',
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');

        link.href = url;
        link.download = `console-${new Date()
            .toISOString()
            .replaceAll(':', '-')}.log`;

        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
    };

    return (
        <article className="astreon-console-clean">
            <div className="astreon-console-actions">
                <button
                    type="button"
                    onClick={() => void copyLogs()}
                    disabled={lines.length === 0}
                    className="copy"
                >
                    {copied ? '✓ Copié' : '📋 Copier'}
                </button>

                <button
                    type="button"
                    onClick={downloadLogs}
                    disabled={lines.length === 0}
                    className="download"
                >
                    ⬇ Télécharger
                </button>

                <button
                    type="button"
                    onClick={onClear}
                    disabled={lines.length === 0}
                    className="clear"
                >
                    🧹 Effacer l’affichage
                </button>
            </div>

            <div
                ref={consoleRef}
                className="astreon-console-output"
            >
                {lines.length === 0 ? (
                    <div className="astreon-console-empty">
                        <p>En attente des logs</p>
                        <span>Dernière vérification : {timeNow()}</span>
                    </div>
                ) : (
                    lines.map((line, index) => (
                        <div
                            key={`${index}-${line.slice(0, 28)}`}
                            className="astreon-console-line"
                        >
                            <span>
                                {String(index + 1).padStart(4, '0')}
                            </span>
                            {line}
                        </div>
                    ))
                )}
            </div>

            <form
                onSubmit={submit}
                className="astreon-console-command"
            >
                <label className="sr-only">
                    Commande serveur
                </label>

                <input
                    value={command}
                    onChange={(event) =>
                        setCommand(event.target.value)
                    }
                    disabled={!connected}
                    placeholder={
                        connected
                            ? 'Saisir une commande serveur...'
                            : 'Console indisponible'
                    }
                    autoComplete="off"
                />

                <button
                    type="submit"
                    disabled={!connected || command.trim() === ''}
                >
                    Envoyer
                </button>
            </form>
        </article>
    );
}
