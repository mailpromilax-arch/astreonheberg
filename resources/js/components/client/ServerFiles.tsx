import Editor, { OnMount } from '@monaco-editor/react';
import { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';

type ServerFile = {
    name: string;
    size: number;
    is_file: boolean;
    is_editable: boolean;
};

type Props = {
    serviceId: number;
};

const csrf = () =>
    document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '';

const bytes = (value: number) => {
    if (!value) return '0 o';
    const units = ['o', 'Ko', 'Mo', 'Go'];
    const index = Math.min(Math.floor(Math.log(value) / Math.log(1024)), units.length - 1);
    return `${(value / 1024 ** index).toLocaleString('fr-FR', { maximumFractionDigits: 2 })} ${units[index]}`;
};

const join = (root: string, name: string) => root === '/' ? `/${name}` : `${root}/${name}`;

const editorLanguage = (file: string | null): string => {
    if (!file) return 'plaintext';

    const name = file.toLowerCase();
    const extension = name.split('.').pop() ?? '';

    const languages: Record<string, string> = {
        conf: 'ini',
        cfg: 'ini',
        env: 'ini',
        ini: 'ini',
        properties: 'ini',
        json: 'json',
        json5: 'json',
        yml: 'yaml',
        yaml: 'yaml',
        xml: 'xml',
        html: 'html',
        htm: 'html',
        css: 'css',
        scss: 'scss',
        js: 'javascript',
        cjs: 'javascript',
        mjs: 'javascript',
        ts: 'typescript',
        tsx: 'typescript',
        jsx: 'javascript',
        php: 'php',
        py: 'python',
        sh: 'shell',
        bash: 'shell',
        ps1: 'powershell',
        sql: 'sql',
        md: 'markdown',
        txt: 'plaintext',
        log: 'plaintext',
        lua: 'lua',
        toml: 'ini',
    };

    return languages[extension] ?? 'plaintext';
};

export default function ServerFiles({ serviceId }: Props) {
    const [directory, setDirectory] = useState('/');
    const [files, setFiles] = useState<ServerFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedFile, setSelectedFile] = useState<string | null>(null);
    const [content, setContent] = useState('');
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [savedMessage, setSavedMessage] = useState('');

    const api = useCallback(async (path: string, options: RequestInit = {}) => {
        const response = await fetch(`/client/services/${serviceId}/files${path}`, {
            credentials: 'same-origin',
            ...options,
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'X-CSRF-TOKEN': csrf(),
                ...(options.headers ?? {}),
            },
        });

        const payload = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(payload.message ?? `Erreur HTTP ${response.status}`);
        }

        return payload;
    }, [serviceId]);

    const load = useCallback(async (target: string) => {
        setLoading(true);
        setError('');

        try {
            const payload = await api(`?directory=${encodeURIComponent(target)}`);
            setDirectory(payload.directory ?? target);
            setFiles(payload.files ?? []);
            setSelectedFile(null);
            setContent('');
        } catch (exception) {
            setError(exception instanceof Error ? exception.message : 'Chargement impossible.');
        } finally {
            setLoading(false);
        }
    }, [api]);

    useEffect(() => {
        load('/');
    }, [load]);

    const breadcrumbs = useMemo(() => {
        const parts = directory.split('/').filter(Boolean);
        return [
            { label: 'Racine', path: '/' },
            ...parts.map((part, index) => ({
                label: part,
                path: `/${parts.slice(0, index + 1).join('/')}`,
            })),
        ];
    }, [directory]);

    const open = async (file: ServerFile) => {
        if (!file.is_file) {
            await load(join(directory, file.name));
            return;
        }

        /*
         * Pterodactyl peut renvoyer is_editable=false pour certains
         * fichiers texte. On tente quand même la lecture et l'API
         * décidera si le fichier est réellement accessible.
         */
        const blockedExtensions = [
            '.exe',
            '.dll',
            '.jar',
            '.zip',
            '.tar',
            '.gz',
            '.7z',
            '.png',
            '.jpg',
            '.jpeg',
            '.gif',
            '.webp',
            '.mp3',
            '.ogg',
            '.wav',
            '.mp4',
            '.mov',
            '.db',
            '.sqlite',
        ];

        const lowerName = file.name.toLowerCase();

        if (
            blockedExtensions.some((extension) =>
                lowerName.endsWith(extension),
            )
        ) {
            setError(
                'Ce fichier est binaire et ne peut pas être ouvert dans l’éditeur.',
            );
            return;
        }

        setError('');

        try {
            const fullPath = join(directory, file.name);
            const payload = await api(`/contents?file=${encodeURIComponent(fullPath)}`);
            setSelectedFile(fullPath);
            setContent(payload.content ?? '');
        } catch (exception) {
            setError(exception instanceof Error ? exception.message : 'Lecture impossible.');
        }
    };

    const save = async () => {
        if (!selectedFile) return;

        setSaving(true);
        setError('');
        setSavedMessage('');

        try {
            await api('/write', {
                method: 'PUT',
                body: JSON.stringify({
                    file: selectedFile,
                    content,
                }),
            });

            setSavedMessage('Fichier enregistré');

            window.setTimeout(() => {
                setSavedMessage('');
            }, 2500);
        } catch (exception) {
            setError(
                exception instanceof Error
                    ? exception.message
                    : 'Enregistrement impossible.',
            );
        } finally {
            setSaving(false);
        }
    };

    const mountEditor: OnMount = (editor, monaco) => {
        editor.addCommand(
            monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS,
            () => {
                void save();
            },
        );

        editor.focus();
    };

    const createFolder = async () => {
        const name = window.prompt('Nom du nouveau dossier :');
        if (!name?.trim()) return;

        try {
            await api('/folder', {
                method: 'POST',
                body: JSON.stringify({ root: directory, name: name.trim() }),
            });
            await load(directory);
        } catch (exception) {
            setError(exception instanceof Error ? exception.message : 'Création impossible.');
        }
    };

    const rename = async (file: ServerFile) => {
        const to = window.prompt('Nouveau nom :', file.name);
        if (!to?.trim() || to === file.name) return;

        try {
            await api('/rename', {
                method: 'PUT',
                body: JSON.stringify({ root: directory, from: file.name, to: to.trim() }),
            });
            await load(directory);
        } catch (exception) {
            setError(exception instanceof Error ? exception.message : 'Renommage impossible.');
        }
    };

    const remove = async (file: ServerFile) => {
        if (!window.confirm(`Supprimer définitivement « ${file.name} » ?`)) return;

        try {
            await api('/delete', {
                method: 'POST',
                body: JSON.stringify({ root: directory, files: [file.name] }),
            });
            await load(directory);
        } catch (exception) {
            setError(exception instanceof Error ? exception.message : 'Suppression impossible.');
        }
    };

    const download = async (file: ServerFile) => {
        try {
            const payload = await api(`/download?file=${encodeURIComponent(join(directory, file.name))}`);
            if (payload.url) window.open(payload.url, '_blank', 'noopener,noreferrer');
        } catch (exception) {
            setError(exception instanceof Error ? exception.message : 'Téléchargement impossible.');
        }
    };

    const upload = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploading(true);

        try {
            const payload = await api('/upload');
            if (!payload.url) throw new Error('URL d’envoi absente.');

            const formData = new FormData();
            formData.append('files', file);

            const separator = payload.url.includes('?') ? '&' : '?';
            const response = await fetch(
                `${payload.url}${separator}directory=${encodeURIComponent(directory)}`,
                { method: 'POST', body: formData },
            );

            if (!response.ok) throw new Error(`Échec de l’envoi (${response.status}).`);
            await load(directory);
        } catch (exception) {
            setError(exception instanceof Error ? exception.message : 'Envoi impossible.');
        } finally {
            event.target.value = '';
            setUploading(false);
        }
    };

    return (
        <article className="rounded-3xl border border-white/10 bg-[#070d18] p-7">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <p className="text-sm font-black uppercase tracking-[0.25em] text-cyan-400">Gestionnaire</p>
                    <h2 className="mt-2 text-3xl font-black">Fichiers du serveur</h2>
                </div>

                <div className="flex gap-3">
                    <button type="button" onClick={createFolder} className="rounded-xl border border-white/10 px-4 py-2 font-bold hover:bg-white/5">
                        📁 Nouveau dossier
                    </button>

                    <label className="cursor-pointer rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 px-4 py-2 font-black">
                        {uploading ? 'Envoi...' : '⬆ Upload'}
                        <input type="file" className="hidden" onChange={upload} disabled={uploading} />
                    </label>
                </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2 text-sm">
                {breadcrumbs.map((item, index) => (
                    <div key={item.path} className="flex items-center gap-2">
                        {index > 0 && <span className="text-slate-600">/</span>}
                        <button type="button" onClick={() => load(item.path)} className="font-bold text-slate-300 hover:text-white">
                            {item.label}
                        </button>
                    </div>
                ))}
            </div>

            {error && (
                <div className="mt-5 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300">
                    {error}
                </div>
            )}

            <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
                <div className="grid grid-cols-[1fr_100px_150px] bg-white/[0.04] px-4 py-3 text-xs font-black uppercase text-slate-500">
                    <span>Nom</span><span>Taille</span><span className="text-right">Actions</span>
                </div>

                {loading ? (
                    <div className="p-8 text-center text-slate-400">Chargement...</div>
                ) : files.length === 0 ? (
                    <div className="p-8 text-center text-slate-400">Ce dossier est vide.</div>
                ) : files.map((file) => (
                    <div key={file.name} className="grid grid-cols-[1fr_100px_150px] items-center border-t border-white/5 px-4 py-3 hover:bg-white/[0.03]">
                        <button type="button" onClick={() => open(file)} className="flex min-w-0 items-center gap-3 text-left">
                            <span>{file.is_file ? '📄' : '📁'}</span>
                            <span className="truncate font-bold">{file.name}</span>
                        </button>

                        <span className="text-sm text-slate-400">{file.is_file ? bytes(file.size) : '—'}</span>

                        <div className="flex justify-end gap-2">
                            {file.is_file && (
                                <button type="button" onClick={() => download(file)} className="rounded-lg border border-white/10 px-2 py-1">⬇</button>
                            )}
                            <button type="button" onClick={() => rename(file)} className="rounded-lg border border-white/10 px-2 py-1">✏</button>
                            <button type="button" onClick={() => remove(file)} className="rounded-lg border border-red-400/20 px-2 py-1 text-red-300">🗑</button>
                        </div>
                    </div>
                ))}
            </div>

            {selectedFile && (
                <div
                    className={
                        isFullscreen
                            ? 'fixed inset-0 z-[100] flex flex-col bg-[#050b18] p-5'
                            : 'mt-7 rounded-2xl border border-white/10 bg-black/30 p-5'
                    }
                >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="min-w-0">
                            <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-400">
                                Éditeur Astreon
                            </p>
                            <p className="mt-1 truncate font-black">
                                {selectedFile}
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            {savedMessage && (
                                <span className="text-sm font-bold text-emerald-300">
                                    ✓ {savedMessage}
                                </span>
                            )}

                            <button
                                type="button"
                                onClick={() =>
                                    setIsFullscreen((current) => !current)
                                }
                                className="rounded-xl border border-white/10 px-4 py-3 font-bold hover:bg-white/5"
                            >
                                {isFullscreen
                                    ? '↙ Quitter le plein écran'
                                    : '⛶ Plein écran'}
                            </button>

                            <button
                                type="button"
                                onClick={() => void save()}
                                disabled={saving}
                                className="rounded-xl bg-emerald-500 px-5 py-3 font-black disabled:opacity-50"
                            >
                                {saving
                                    ? 'Enregistrement...'
                                    : '💾 Enregistrer'}
                            </button>
                        </div>
                    </div>

                    <div
                        className={
                            isFullscreen
                                ? 'mt-5 min-h-0 flex-1 overflow-hidden rounded-xl border border-white/10'
                                : 'mt-5 h-[560px] overflow-hidden rounded-xl border border-white/10'
                        }
                    >
                        <Editor
                            height="100%"
                            path={selectedFile}
                            language={editorLanguage(selectedFile)}
                            theme="vs-dark"
                            value={content}
                            onChange={(value) =>
                                setContent(value ?? '')
                            }
                            onMount={mountEditor}
                            loading={
                                <div className="flex h-full items-center justify-center bg-[#090e17] text-slate-400">
                                    Chargement de l’éditeur...
                                </div>
                            }
                            options={{
                                automaticLayout: true,
                                minimap: {
                                    enabled: true,
                                },
                                fontSize: 14,
                                lineHeight: 22,
                                fontLigatures: true,
                                wordWrap: 'on',
                                scrollBeyondLastLine: false,
                                smoothScrolling: true,
                                cursorSmoothCaretAnimation: 'on',
                                bracketPairColorization: {
                                    enabled: true,
                                },
                                guides: {
                                    bracketPairs: true,
                                    indentation: true,
                                },
                                renderWhitespace: 'selection',
                                tabSize: 4,
                                insertSpaces: true,
                                formatOnPaste: true,
                                formatOnType: true,
                                quickSuggestions: true,
                                suggestOnTriggerCharacters: true,
                                padding: {
                                    top: 14,
                                    bottom: 14,
                                },
                            }}
                        />
                    </div>

                    <p className="mt-3 text-xs text-slate-500">
                        Raccourci : Ctrl + S pour enregistrer
                    </p>
                </div>
            )}
        </article>
    );
}