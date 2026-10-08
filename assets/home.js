'use strict';

/* =========================================================
   Avis Discord affichés sur l'accueil (textes recopiés tels quels).
   Pour ajouter une photo de profil : mets l'image dans assets/avatars/
   puis ajoute  avatar: 'assets/avatars/nom.png'  à l'avis.
   ========================================================= */
const REVIEWS = [
  { name: '.Devlabs', date: '17/09/2025', avatar: 'assets/avatars/devlabs.png', text: '@Ypo. m\'a fait une correction sur beaucoup de mapping, le travail est de qualité il est très à l\'écoute. Il est rapide et abordable je recommande fortement' },
  { name: 'sbri lamouche', date: '17/09/2025', avatar: 'assets/avatars/sbri-lamouche.png', text: 'Slt a tous je voulais vraiment féliciter l équipe pour la réactivité j ai fait connaissance dans un groupe ma régler tout mes problèmes et en les optimisant pour un prix très très raisonnable je recommande les yeux fermer . Force a vous' },
  { name: 'SlowZYy', date: '18/09/2025', avatar: 'assets/avatars/slowzyy.png', text: 'Salut très bon travail' },
  { name: 'RED', date: '18/09/2025', avatar: 'assets/avatars/red.png', text: 'Salut gg pour le taff il ma fix 15 mapping force à ton projet bg' },
  { name: '✨', date: '19/09/2025', avatar: 'assets/avatars/avis-5.png', text: 'Si vous voulez quelque chose de qualité et de rapide n\'hésitez pas à contacter @Ypo. ! Très à l\'écoute, fiable et plus qu\'abordable ! Je recommande ! Merci beaucoup !' },
  { name: 'Darkish', date: '21/09/2025', avatar: 'assets/avatars/darkish.png', text: 'Ultra propre, réactif. Service de qualité. Vous pouvez y allé les yeux fermé' },
  { name: '"Zephyrrr', date: '28/09/2025', avatar: 'assets/avatars/zephyrrr.png', text: 'Ultra reactif c\'est du lourd merci @pegaz' },
  { name: 'Fructoszee', date: '03/10/2025', avatar: 'assets/avatars/fructoszee.png', text: 'Travail rapide, efficace, et réactif, rien à redire de plus !' },
  { name: 'Kayy', date: '05/10/2025', avatar: 'assets/avatars/kayy.png', text: 'Rapide efficace pepite' },
  { name: 'Sakho_', date: '07/10/2025', avatar: 'assets/avatars/sakho.png', text: 'Travail propre, ultra rapide, très sympa ! ★★★★★' },
  { name: 'Mr Sakou', date: '07/10/2025', avatar: 'assets/avatars/mr-sakou.png', text: 'Bonjour, super travail ! Toujours attentif et des corrections au top. Merci beaucoup Ypo !' },
  { name: 'VRAI DZ', date: '08/10/2025', avatar: 'assets/avatars/vrai-dz.png', text: 'Travail propre , rapidité excellente , Merci beaucoup !! @pegaz' },
  { name: 'VRAI DZ', date: '08/10/2025', avatar: 'assets/avatars/vrai-dz.png', text: 'Hud très clean très rapide merci encore !!' },
  { name: 'deletedaccount343234', date: '09/10/2025', avatar: 'assets/avatars/deletedaccount343234.png', text: 'Service au top ! Travail rapide, propre et super pro. Bugs corrigés à la perfection, le tout avec une super attitude. Je recommande les yeux fermés ! @Ypo. ⭐⭐⭐⭐⭐' },
  { name: 'Bestie 💋 Bestie', date: '10/10/2025', avatar: 'assets/avatars/bestie-bestie.png', text: 'Looking for professional service that you\'ll actually get your desired results ?? @Ypo. is the guy! He strives for perfection and in a timley manner. He went above and beyond with communicating with us and we could not be happier with his service and efforts. 10/10 Thanks @Ypo.' },
  { name: 'Osheun', date: '16/10/2025', avatar: 'assets/avatars/osheun.png', text: 'Hello, pour ma part j\'ai également pris les services d\'@Ypo. . J\'avais tellement de collisions que j\'ai utilisé des outils qui faisait lag mon serveur et qui retirer de la végétation importante des mappings. Depuis que j\'ai retirer tout ça j\'ai fait appel à Ypo, il m\'as tout régler ultra rapidement j\'ai retrouvé des mappings beau dans collisions et sans auxjn problème. Je recommande les yeux fermés ✨✨✨✨✨' },
  { name: 'taha87forever', date: '17/10/2025', avatar: 'assets/avatars/taha87forever.png', text: 'He solved the problem I had with another map maker within hours. He was really fast, helpful, and kind. I didn\'t trust him at first, but now he\'s earned my trust. If I have any problems with maps, I\'ll be the first to contact @Ypo. .' },
  { name: 'azrod', date: '17/10/2025', avatar: 'assets/avatars/azrod.png', text: 'Travail rapide, efficace, et réactif, rien à redire de plus ! @pegaz' },
  { name: 'Red Blade V2 / Daniel Peter', date: '18/10/2025', avatar: 'assets/avatars/red-blade-v2-daniel-peter.png', text: 'Professional, quick, and on point! @Ypo. fixed some map problems in Ice-T\'s server. Highly recommended!' },
  { name: '.Lakdar', date: '20/10/2025', avatar: 'assets/avatars/lakdar.png', text: 'Efficace, Rapide rien a re dire en 10 minutes tout été bon !' },
  { name: 'N9ne', date: '26/10/2025', avatar: 'assets/avatars/n9ne.png', text: 'Rapide de fou, très professionnel, super sympas incroyable @Ypo.' },
  { name: 'Bavette\'', date: '28/10/2025', avatar: 'assets/avatars/bavette.png', text: 'Travail propre, rapidité excellente, rien a dire' },
  { name: 'MikeyTheGreat', date: '09/11/2025', avatar: 'assets/avatars/mikeythegreat.png', text: 'I\'ve been scammed by plenty of map developers before, but this one is the real deal. He kept his word, delivered exactly what he promised, and handled everything professionally. I\'m genuinely happy with the business we\'ve done... and I can already tell I\'m going to make him a lot of money with solid honest work.' },
  { name: 'rzsquad', date: '08/12/2025', avatar: 'assets/avatars/rzsquad.png', text: 'Je tiens à remercier @Ypo. pour sa rapidité et son professionnalisme. En 20 minutes il a su régler des collision et update certaines choses. Franchement bravo !' },
  { name: '윤서진', date: '30/12/2025', avatar: 'assets/avatars/avis-25.png', text: '.Thank you, @Ypo. The collision was fixed quickly and properly. Really appreciate the fast support.' },
  { name: 'ADK', date: '30/12/2025', avatar: 'assets/avatars/adk.png', text: 'Travaille de fou fait par @Ypo., Hyper réactifs il n\'hesite pas a faire des update lorsque certain props on été oubliée etc. 🔥' },
  { name: 'VYN', date: '03/01/2026', avatar: 'assets/avatars/vyn.png', text: '1000/10 Best map fixer out there cheap and fast work with amazing quality @Ypo.' },
  { name: 'Kyiuu_', date: '03/01/2026', avatar: 'assets/avatars/kyiuu.png', text: '1000000/10 Travail propre, rapide il connais son taff qu\'il doit faire je recommande les reuf 😉' },
  { name: 'Teddo', date: '04/01/2026', avatar: 'assets/avatars/teddo.png', text: '10/10 @Ypo. fixed immediatly with fast responses !' },
  { name: 'Mirage ミラゲ', date: '06/01/2026', avatar: 'assets/avatars/mirage.png', text: '20/20 @Ypo. fast and kind ty for everything' },
  { name: 'CLS63S', date: '06/01/2026', avatar: 'assets/avatars/cls63s.png', text: '100/10 @Ypo. actif, rapide, travaille incroyable.' },
  { name: '! René.G', date: '08/01/2026', avatar: 'assets/avatars/ren-g.png', text: '10/10 @Ypo. I can\'t describe it, he just saved my ass.' },
  { name: 'STORN', date: '10/01/2026', avatar: 'assets/avatars/storn.png', text: '1 000 000 / 10, le boss. @Ypo. Il m\'a sauvé la vie, il a vraiment pris le temps de comprendre mon problème. Toujours dispo, rapide, travail carré. Foncez les gars, c\'est le meilleur dans ce domaine 😉' },
  { name: '"! Toto', date: '10/01/2026', avatar: 'assets/avatars/toto.png', text: '10/10 @Ypo. le boss des boss je vous le recommande les reuf il c\'est ce qu\'il fait et est très rapide et efficace ! 🔥' },
  { name: 'onapayroll', date: '16/01/2026', avatar: 'assets/avatars/onapayroll.png', text: '10/10 got the job done efficient af. @Ypo. the goat' },
  { name: 'Nox ツ', date: '22/01/2026', avatar: 'assets/avatars/nox.png', text: '10/10 @Ypo. franchement le support est cali si vous avez un problème il vous aide avec plaisir je recommande il c\'est ce qu\'il fait ! 👌' },
  { name: 'mazettegun', date: '13/02/2026', avatar: 'assets/avatars/mazettegun.png', text: '10/10 @Ypo. rien à dire rapide efficace' },
  { name: 'Shorty', date: '01/03/2026', avatar: 'assets/avatars/shorty.png', text: '⭐⭐⭐⭐⭐ Je recommande vivement @Ypo. ! Il a pris beaucoup de temps pour tout configurer correctement. Son travail est extrêmement précis et professionnel. Grâce à lui, nous avons pu intégrer avec succès de nombreuses nouvelles cartes. Merci beaucoup pour ton excellent soutien !' },
  { name: 'DALI', date: '21/03/2026', avatar: 'assets/avatars/dali.png', text: '@Ypo. Exellent service rapide et efficase' },
  { name: 'Jake', date: '24/03/2026', avatar: 'assets/avatars/jake.png', text: '⭐⭐⭐⭐⭐ @Ypo. Juste le goat, hyper adaptable, service super rapide. Il a vraiment pris le temps pour fix les différents problèmes. Je trouve que les prix sont tout à fait à la hauteur de la prestation. Je recommande vivement ! Merci encore !' },
  { name: 'F430', date: '27/03/2026', avatar: 'assets/avatars/f430.png', text: '@Ypo. Goad tout simplement il a géré de fou 5stars' },
  { name: 'NjShade', date: '02/04/2026', avatar: 'assets/avatars/njshade.png', text: '20/20 merci a @Ypo. pour les problemes de mapping, vous pouvez faire 100% confiance !!!' },
  { name: 'BLACK ONI', date: '06/04/2026', avatar: 'assets/avatars/black-oni.png', text: '10/10 Un grand Merci a @Ypo. pour m\'avoir aider a corriger des bug de mapping merci a lui !' },
  { name: 'Uminøx', date: '07/04/2026', avatar: 'assets/avatars/umin-x.png', text: 'Merci beaucoup Très fort explique correctement du pourquoi du comment et a l\'écoute je recommande vrm travaille très sérieux et rapide ⭐⭐⭐⭐⭐' },
  { name: '.bris', date: '12/04/2026', avatar: 'assets/avatars/bris.png', text: '10/10, @Ypo. by far the best mapper i\'ve came across. Fixed the issue instantly, and he offers support, I have zero complaints. He\'s outstanding!' },
  { name: 'DALI', date: '18/04/2026', avatar: 'assets/avatars/dali.png', text: 'Pour la 2eme fois c nickel bravo @Ypo.' },
  { name: 'SinCos †', date: '18/04/2026', avatar: 'assets/avatars/sincos.png', text: '10/10 rapide efficace support insane il viens en vocal et tout il est au top. merci @Ypo. 🙏' },
  { name: 'Niah', date: '28/04/2026', avatar: 'assets/avatars/niah.png', text: '10.10 fast, reliable and has become my only map dev' },
  { name: 'User', date: '06/05/2026', avatar: 'assets/avatars/user.png', text: 'Travail propre, rapidité excellente, rien a dire @Ypo.' },
  { name: 'Owen', date: '06/05/2026', avatar: 'assets/avatars/owen.png', text: 'Incroyable travail effectué pas dessus tu rendu IG merci à toi pour ton travail' },
  { name: 'Uminøx', date: '24/05/2026', avatar: 'assets/avatars/umin-x.png', text: '1000/10 incroyable comme d\'habitude sa change pas 🔥 merciii beaucoup.' },
  { name: 'Gr|x', date: '26/06/2026', avatar: 'assets/avatars/gr-x.png', text: 'rapide et efficace' },
];

const ICON_PAUSE = '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>';
const ICON_PLAY = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 4.5v15a1 1 0 0 0 1.5.86l12.5-7.5a1 1 0 0 0 0-1.72L8.5 3.64A1 1 0 0 0 7 4.5Z"/></svg>';
const ICON_DISCORD = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.317 4.37a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.865-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.74 19.74 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.1 13.1 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .078-.01c3.927 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .079.009c.12.1.246.198.373.292a.077.077 0 0 1-.007.128 12.3 12.3 0 0 1-1.873.891.077.077 0 0 0-.041.107c.36.698.772 1.363 1.225 1.993a.076.076 0 0 0 .084.029 19.84 19.84 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03ZM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.956 2.418-2.157 2.418Zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.946 2.418-2.157 2.418Z"/></svg>';

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* ---------- Avis ---------- */
const AVATAR_COLORS = ['#5865f2', '#eb459e', '#23a55a', '#f0b232', '#38bdf8', '#f23f43', '#9b59b6', '#1abc9c'];
const avatarColor = (name) => AVATAR_COLORS[[...name].reduce((h, c) => (h * 31 + c.codePointAt(0)) >>> 0, 7) % AVATAR_COLORS.length];
// Mentions Discord (@Ypo.) affichées comme dans Discord
const withMentions = (text) => esc(text).replace(/@[\w.]+/g, (m) => `<span class="mention">${m}</span>`);

if (REVIEWS.length) {
  const track = document.querySelector('#reviewMarquee .marquee-track');
  track.innerHTML = REVIEWS.map((r) => {
    const initial = esc([...r.name.replace(/^[^\p{L}\p{N}]+/u, '') || r.name][0].toUpperCase());
    const avatar = r.avatar
      ? `<img class="avatar" src="${esc(r.avatar)}" alt="" loading="lazy">`
      : `<span class="avatar" style="background:${avatarColor(r.name)}">${initial}</span>`;
    return `<div class="review-card">
      <div class="who">${avatar}<span><b>${esc(r.name)}</b>${esc(r.date || '')}</span><i class="review-src" title="Discord">${ICON_DISCORD}</i></div>
      <p>${withMentions(r.text)}</p>
    </div>`;
  }).join('');
  document.getElementById('reviewMarquee').hidden = false;
}

/* =========================================================
   Partenaires (bannières).
   - 0 partenaire  : la section est cachée
   - 1 ou 2        : cartes fixes, centrées, sans animation
   - 3 et plus     : les cartes défilent en boucle
   Exemple :
   { name: 'Nom du serveur', text: 'Petite description du partenaire.', tag: 'FiveM RP',
     banner: 'assets/partners/nom-banniere.png', logo: 'assets/partners/nom-logo.png', link: 'https://discord.gg/xxxx' },
   La bannière idéale fait 880 × 300 px (elle est recadrée automatiquement).
   ========================================================= */
const PARTNERS = [
  // Copie ce bloc pour chaque partenaire et change les valeurs
  {
    name: 'Vizu',                                  // nom affiché
    text: 'Serveur RP FiveM.',                     // description (3 lignes max)
    tag: 'Serveur RP',                             // petite étiquette à côté du nom
    logo: 'assets/partners/vizu-logo.jpg',         // logo carré (optionnel)
    banner: 'assets/partners/vizu-banniere.jpg',   // bannière (optionnel, sinon dégradé)
    link: 'https://discord.gg/vizu',               // lien au clic (vide = pas cliquable)
  },
];

const ICON_ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M9 7h8v8"/></svg>';

{
  const marquee = document.getElementById('partnerMarquee');
  const section = document.getElementById('partenaires');
  if (marquee && section) {
    const card = (p) => {
      const initial = esc([...p.name.replace(/^[^\p{L}\p{N}]+/u, '') || p.name][0].toUpperCase());
      const banner = p.banner
        ? `<div class="partner-banner" style="background-image:url('${esc(p.banner)}')"></div>`
        : `<div class="partner-banner" style="--c:${avatarColor(p.name)}"></div>`;
      const logo = p.logo
        ? `<img class="partner-logo" src="${esc(p.logo)}" alt="" loading="lazy">`
        : `<span class="partner-logo" style="background:${avatarColor(p.name)}">${initial}</span>`;
      // Sans lien, la carte n'est pas cliquable
      const open = p.link ? `<a class="partner-card" href="${esc(p.link)}" target="_blank" rel="noopener">` : '<div class="partner-card">';
      return `${open}
        ${banner}
        <div class="partner-body">${logo}
          <div class="partner-info"><b>${esc(p.name)}</b>${p.tag ? `<span class="partner-tag">${esc(p.tag)}</span>` : ''}</div>
          ${p.link ? `<i class="partner-go">${ICON_ARROW}</i>` : ''}
        </div>
        ${p.text ? `<p class="partner-text">${esc(p.text)}</p>` : ''}
      ${p.link ? '</a>' : '</div>'}`;
    };

    if (!PARTNERS.length) {
      section.hidden = true;
      marquee.hidden = true;
    } else if (PARTNERS.length < 3) {
      // Peu de partenaires : cartes fixes, pas de défilement ni de bouton Pause
      marquee.classList.add('static');
      section.querySelector('.play').hidden = true;
      marquee.querySelector('.marquee-track').innerHTML = PARTNERS.map(card).join('');
    } else {
      // Assez de cartes pour couvrir un grand écran, sinon on répète la liste
      let list = PARTNERS;
      while (list.length * 476 < 2200) list = list.concat(PARTNERS);
      marquee.querySelector('.marquee-track').innerHTML = list.map(card).join('');
    }
  }
}

/* ---------- Carrousels infinis + bouton Pause / Lecture ---------- */
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.querySelectorAll('.marquee:not(.static)').forEach((m) => {
  const track = m.querySelector('.marquee-track');
  // On duplique le contenu pour une boucle sans coupure
  [...track.children].forEach((c) => {
    const clone = c.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    track.appendChild(clone);
  });
  // Vitesse constante quel que soit le nombre de cartes
  track.style.animationDuration = Math.max(20, track.children.length * 4) + 's';
  if (reduceMotion) m.classList.add('paused');
});

// Un bouton peut piloter plusieurs carrousels (data-marquee="id1 id2")
document.querySelectorAll('.play[data-marquee]').forEach((btn) => {
  const ms = btn.dataset.marquee.split(' ').map((id) => document.getElementById(id)).filter(Boolean);
  const sync = () => {
    const paused = ms[0].classList.contains('paused');
    btn.innerHTML = (paused ? ICON_PLAY : ICON_PAUSE) + t(paused ? 'play' : 'pause');
    btn.setAttribute('aria-pressed', String(paused));
  };
  btn.addEventListener('click', () => {
    const pause = !ms[0].classList.contains('paused');
    ms.forEach((m) => m.classList.toggle('paused', pause));
    sync();
  });
  document.addEventListener('langchange', sync);
  sync();
});

/* ---------- Simulation « 3 étapes » avec les éléments de la page Scanner, en boucle ---------- */
const flow = document.getElementById('flow');
if (flow) {
  const boxes = flow.querySelectorAll('.flow-box');
  const lines = flow.querySelectorAll('.flow-line');
  const rows = flow.querySelectorAll('.mini-row');
  const bar = document.getElementById('flowBar');
  const status = document.getElementById('flowStatus');
  const btn = flow.querySelector('.mini-btn');
  const TOTAL = 1284;
  const num = (n) => n.toLocaleString(LANG === 'en' ? 'en-GB' : 'fr-FR');
  let timers = [];
  const at = (ms, fn) => timers.push(setTimeout(fn, ms));
  const active = (i) => boxes.forEach((b, k) => b.classList.toggle('active', k === i));

  const finalState = () => {
    bar.style.width = '100%';
    status.textContent = t('flow.found', { n: 3 });
    rows.forEach((r) => r.classList.add('show'));
    rows[2].classList.add('off');
    boxes[2].classList.add('done');
  };

  const cycle = () => {
    timers.forEach(clearTimeout); timers = [];
    bar.style.width = '0%';
    status.textContent = t('p.reading');
    rows.forEach((r) => r.classList.remove('show', 'off'));
    lines.forEach((l) => l.classList.remove('run'));
    boxes[2].classList.remove('done');
    btn.classList.remove('press');

    // 1. Dossier déposé : la barre de progression avance
    active(0);
    for (let i = 1; i <= 24; i++) {
      at(300 + i * 55, () => {
        bar.style.width = (i / 24 * 100) + '%';
        status.textContent = t('p.check', { n: num(Math.round(TOTAL * i / 24)), total: num(TOTAL) });
      });
    }
    at(1750, () => { status.textContent = t('flow.found', { n: 3 }); });
    // 2. Le point part vers la liste : les conflits apparaissent, on décoche le dernier
    at(2000, () => lines[0].classList.add('run'));
    at(2800, () => active(1));
    rows.forEach((r, i) => at(3000 + i * 380, () => r.classList.add('show')));
    at(4500, () => rows[2].classList.add('off'));
    // 3. Le point part vers le récap : clic sur « Télécharger », l'aperçu apparaît
    at(5000, () => lines[1].classList.add('run'));
    at(5800, () => active(2));
    at(6300, () => btn.classList.add('press'));
    at(6550, () => boxes[2].classList.add('done'));
    // On recommence
    at(10000, cycle);
  };

  if (reduceMotion) finalState();
  else cycle();
}

/* ---------- Avant / après ---------- */
const compare = document.getElementById('compare');
if (compare) {
  const input = compare.querySelector('input');
  const set = () => compare.style.setProperty('--pos', input.value + '%');
  input.addEventListener('input', set);
  set();
}
