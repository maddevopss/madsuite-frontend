## Sécurité auth — amélioration future

Actuellement, l'access token est stocké dans localStorage côté frontend.

Acceptable pour le développement local actuel, mais à éviter en production web à cause du risque XSS.

Plan futur :

- access token gardé uniquement en mémoire React;
- refresh token dans un cookie HTTP-only, Secure, SameSite;
- refresh automatique via /api/refresh;
- logout qui invalide la session côté backend et nettoie le cookie;
- CSP plus stricte avec Helmet.

Version cible plus tard

Architecture recommandée :

Login
↓
Backend retourne :

- access token court dans le body
- refresh token long dans cookie HTTP-only

Frontend :

- garde access token en mémoire seulement
- n’écrit plus le token dans localStorage
- envoie les requêtes avec Authorization: Bearer accessToken

Si 401 :

- appelle /refresh avec withCredentials: true
- le cookie HTTP-only est envoyé automatiquement
- backend renvoie un nouvel access token
- frontend retry la requête originale

## Ce que ça implique dans tes fichiers

Plus tard, tu modifierais principalement :

### `authService.jsx`

Ne plus faire :

<pre class="overflow-visible! px-0!" data-start="2373" data-end="2420"><div class="relative w-full mt-4 mb-1"><div class=""><div class="contents"><div class="relative"><div class="h-full min-h-0 min-w-0"><div class="h-full min-h-0 min-w-0"><div class="border border-token-border-light border-radius-3xl corner-superellipse/1.1 rounded-3xl"><div class="h-full w-full border-radius-3xl bg-token-bg-elevated-secondary corner-superellipse/1.1 overflow-clip rounded-3xl lxnfua_clipPathFallback"><div class="pointer-events-none absolute inset-x-4 top-12 bottom-4"><div class="pointer-events-none sticky z-40 shrink-0 z-1!"><div class="sticky bg-token-border-light"></div></div></div><div class="relative"><div class=""><div class="relative z-0 flex max-w-full"><div id="code-block-viewer" dir="ltr" class="q9tKkq_viewer cm-editor z-10 light:cm-light dark:cm-light flex h-full w-full flex-col items-stretch ͼs ͼ16"><div class="cm-scroller"><pre class="cm-content q9tKkq_readonly m-0"><code><span class="ͼ11">localStorage</span><span class="ͼv">.</span><span>setItem(</span><span class="ͼz">"token"</span><span>, </span><span class="ͼ11">token</span><span>);</span></code></pre></div></div></div></div></div></div></div></div></div><div class=""><div class="h-full min-h-0 min-w-0"></div></div></div></div></div></div></pre>

Garder seulement :

<pre class="overflow-visible! px-0!" data-start="2442" data-end="2503"><div class="relative w-full mt-4 mb-1"><div class=""><div class="contents"><div class="relative"><div class="h-full min-h-0 min-w-0"><div class="h-full min-h-0 min-w-0"><div class="border border-token-border-light border-radius-3xl corner-superellipse/1.1 rounded-3xl"><div class="h-full w-full border-radius-3xl bg-token-bg-elevated-secondary corner-superellipse/1.1 overflow-clip rounded-3xl lxnfua_clipPathFallback"><div class="pointer-events-none absolute inset-x-4 top-12 bottom-4"><div class="pointer-events-none sticky z-40 shrink-0 z-1!"><div class="sticky bg-token-border-light"></div></div></div><div class="relative"><div class=""><div class="relative z-0 flex max-w-full"><div id="code-block-viewer" dir="ltr" class="q9tKkq_viewer cm-editor z-10 light:cm-light dark:cm-light flex h-full w-full flex-col items-stretch ͼs ͼ16"><div class="cm-scroller"><pre class="cm-content q9tKkq_readonly m-0"><code><span class="ͼ11">localStorage</span><span class="ͼv">.</span><span>setItem(</span><span class="ͼz">"user"</span><span>, </span><span class="ͼ11">JSON</span><span class="ͼv">.</span><span>stringify(</span><span class="ͼ11">user</span><span>));</span></code></pre></div></div></div></div></div></div></div></div></div><div class=""><div class="h-full min-h-0 min-w-0"></div></div></div></div></div></div></pre>

Ou même idéalement garder `user` en mémoire aussi, si tu veux être plus strict.

### `authContext.jsx`

Remplacer l’initialisation :

<pre class="overflow-visible! px-0!" data-start="2639" data-end="2708"><div class="relative w-full mt-4 mb-1"><div class=""><div class="contents"><div class="relative"><div class="h-full min-h-0 min-w-0"><div class="h-full min-h-0 min-w-0"><div class="border border-token-border-light border-radius-3xl corner-superellipse/1.1 rounded-3xl"><div class="h-full w-full border-radius-3xl bg-token-bg-elevated-secondary corner-superellipse/1.1 overflow-clip rounded-3xl lxnfua_clipPathFallback"><div class="pointer-events-none absolute inset-x-4 top-12 bottom-4"><div class="pointer-events-none sticky z-40 shrink-0 z-1!"><div class="sticky bg-token-border-light"></div></div></div><div class="relative"><div class=""><div class="relative z-0 flex max-w-full"><div id="code-block-viewer" dir="ltr" class="q9tKkq_viewer cm-editor z-10 light:cm-light dark:cm-light flex h-full w-full flex-col items-stretch ͼs ͼ16"><div class="cm-scroller"><pre class="cm-content q9tKkq_readonly m-0"><code><span class="ͼv">const</span><span> [</span><span class="ͼ11">token</span><span>, </span><span class="ͼ11">setToken</span><span>] </span><span class="ͼv">=</span><span></span><span class="ͼ11">useState</span><span>(</span><span class="ͼ11">authService</span><span class="ͼv">.</span><span>getToken());</span></code></pre></div></div></div></div></div></div></div></div></div><div class=""><div class="h-full min-h-0 min-w-0"></div></div></div></div></div></div></pre>

par :

<pre class="overflow-visible! px-0!" data-start="2717" data-end="2768"><div class="relative w-full mt-4 mb-1"><div class=""><div class="contents"><div class="relative"><div class="h-full min-h-0 min-w-0"><div class="h-full min-h-0 min-w-0"><div class="border border-token-border-light border-radius-3xl corner-superellipse/1.1 rounded-3xl"><div class="h-full w-full border-radius-3xl bg-token-bg-elevated-secondary corner-superellipse/1.1 overflow-clip rounded-3xl lxnfua_clipPathFallback"><div class="pointer-events-none absolute inset-x-4 top-12 bottom-4"><div class="pointer-events-none sticky z-40 shrink-0 z-1!"><div class="sticky bg-token-border-light"></div></div></div><div class="relative"><div class=""><div class="relative z-0 flex max-w-full"><div id="code-block-viewer" dir="ltr" class="q9tKkq_viewer cm-editor z-10 light:cm-light dark:cm-light flex h-full w-full flex-col items-stretch ͼs ͼ16"><div class="cm-scroller"><pre class="cm-content q9tKkq_readonly m-0"><code><span class="ͼv">const</span><span> [</span><span class="ͼ11">token</span><span>, </span><span class="ͼ11">setToken</span><span>] </span><span class="ͼv">=</span><span></span><span class="ͼ11">useState</span><span>(</span><span class="ͼy">null</span><span>);</span></code></pre></div></div></div></div></div></div></div></div></div><div class=""><div class="h-full min-h-0 min-w-0"></div></div></div></div></div></div></pre>

Le token ne survit plus à un refresh navigateur. Au chargement de l’app, tu appelles `/refresh` pour récupérer un nouveau access token si le cookie refresh est valide.

### `api.jsx`

Au lieu de lire :

<pre class="overflow-visible! px-0!" data-start="2973" data-end="3027"><div class="relative w-full mt-4 mb-1"><div class=""><div class="contents"><div class="relative"><div class="h-full min-h-0 min-w-0"><div class="h-full min-h-0 min-w-0"><div class="border border-token-border-light border-radius-3xl corner-superellipse/1.1 rounded-3xl"><div class="h-full w-full border-radius-3xl bg-token-bg-elevated-secondary corner-superellipse/1.1 overflow-clip rounded-3xl lxnfua_clipPathFallback"><div class="pointer-events-none absolute inset-x-4 top-12 bottom-4"><div class="pointer-events-none sticky z-40 shrink-0 z-1!"><div class="sticky bg-token-border-light"></div></div></div><div class="relative"><div class=""><div class="relative z-0 flex max-w-full"><div id="code-block-viewer" dir="ltr" class="q9tKkq_viewer cm-editor z-10 light:cm-light dark:cm-light flex h-full w-full flex-col items-stretch ͼs ͼ16"><div class="cm-scroller"><pre class="cm-content q9tKkq_readonly m-0"><code><span class="ͼv">const</span><span></span><span class="ͼ11">token</span><span></span><span class="ͼv">=</span><span></span><span class="ͼ11">localStorage</span><span class="ͼv">.</span><span>getItem(</span><span class="ͼz">"token"</span><span>);</span></code></pre></div></div></div></div></div></div></div></div></div><div class=""><div class="h-full min-h-0 min-w-0"></div></div></div></div></div></div></pre>

il faudra probablement utiliser un petit module `tokenStore.js` en mémoire :

<pre class="overflow-visible! px-0!" data-start="3107" data-end="3328"><div class="relative w-full mt-4 mb-1"><div class=""><div class="contents"><div class="relative"><div class="h-full min-h-0 min-w-0"><div class="h-full min-h-0 min-w-0"><div class="border border-token-border-light border-radius-3xl corner-superellipse/1.1 rounded-3xl"><div class="h-full w-full border-radius-3xl bg-token-bg-elevated-secondary corner-superellipse/1.1 overflow-clip rounded-3xl lxnfua_clipPathFallback"><div class="pointer-events-none absolute inset-x-4 top-12 bottom-4"><div class="pointer-events-none sticky z-40 shrink-0 z-1!"><div class="sticky bg-token-border-light"></div></div></div><div class="relative"><div class=""><div class="relative z-0 flex max-w-full"><div id="code-block-viewer" dir="ltr" class="q9tKkq_viewer cm-editor z-10 light:cm-light dark:cm-light flex h-full w-full flex-col items-stretch ͼs ͼ16"><div class="cm-scroller"><pre class="cm-content q9tKkq_readonly m-0"><code><span class="ͼv">let</span><span></span><span class="ͼ11">accessToken</span><span></span><span class="ͼv">=</span><span></span><span class="ͼy">null</span><span>;</span><br/><br/><span class="ͼv">export</span><span></span><span class="ͼv">function</span><span></span><span class="ͼ11">setAccessToken</span><span>(</span><span class="ͼ11">token</span><span>) {</span><br/><span></span><span class="ͼ11">accessToken</span><span></span><span class="ͼv">=</span><span></span><span class="ͼ11">token</span><span>;</span><br/><span>}</span><br/><br/><span class="ͼv">export</span><span></span><span class="ͼv">function</span><span></span><span class="ͼ11">getAccessToken</span><span>() {</span><br/><span></span><span class="ͼv">return</span><span></span><span class="ͼ11">accessToken</span><span>;</span><br/><span>}</span><br/><br/><span class="ͼv">export</span><span></span><span class="ͼv">function</span><span></span><span class="ͼ11">clearAccessToken</span><span>() {</span><br/><span></span><span class="ͼ11">accessToken</span><span></span><span class="ͼv">=</span><span></span><span class="ͼy">null</span><span>;</span><br/><span>}</span></code></pre></div></div></div></div></div></div></div></div></div><div class=""><div class="h-full min-h-0 min-w-0"></div></div></div></div></div></div></pre>

Puis dans l’intercepteur Axios :

<pre class="overflow-visible! px-0!" data-start="3364" data-end="3405"><div class="relative w-full mt-4 mb-1"><div class=""><div class="contents"><div class="relative"><div class="h-full min-h-0 min-w-0"><div class="h-full min-h-0 min-w-0"><div class="border border-token-border-light border-radius-3xl corner-superellipse/1.1 rounded-3xl"><div class="h-full w-full border-radius-3xl bg-token-bg-elevated-secondary corner-superellipse/1.1 overflow-clip rounded-3xl lxnfua_clipPathFallback"><div class="pointer-events-none absolute inset-x-4 top-12 bottom-4"><div class="pointer-events-none sticky z-40 shrink-0 z-1!"><div class="sticky bg-token-border-light"></div></div></div><div class="relative"><div class=""><div class="relative z-0 flex max-w-full"><div id="code-block-viewer" dir="ltr" class="q9tKkq_viewer cm-editor z-10 light:cm-light dark:cm-light flex h-full w-full flex-col items-stretch ͼs ͼ16"><div class="cm-scroller"><pre class="cm-content q9tKkq_readonly m-0"><code><span class="ͼv">const</span><span></span><span class="ͼ11">token</span><span></span><span class="ͼv">=</span><span></span><span class="ͼ11">getAccessToken</span><span>();</span></code></pre></div></div></div></div></div></div></div></div></div></div></div></div></div></pre>
