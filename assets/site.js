'use strict';

/* =========================================================
   Réglages du site — à modifier ici
   ========================================================= */
const SITE = {
  discord: 'https://discord.gg/txKSUApN7C', // lien d'invitation Discord (bouton « Communauté »)
};

/* =========================================================
   Langue (FR / EN)
   ========================================================= */
let LANG = (() => { try { return localStorage.getItem('shortt_lang'); } catch { return null; } })();
if (LANG !== 'en') LANG = 'fr';

// Textes des pages (attribut data-i18n). Le français est directement dans le HTML.
const EN = {
  'nav.community': 'Community',
  'nav.open': 'Open scanner',
  'foot.disclaimer': 'Not affiliated with Rockstar Games, Take-Two or Cfx.re.',

  // Accueil
  'title.home': 'Shortt map / Fix',
  'hero.pill': '100% local · no file is uploaded',
  'hero.title': 'Find the <span class="grad">conflicts</span> between your FiveM mappings',
  'hero.text': 'Drop your <code>resources</code> folder: duplicates, overriding files, encrypted or unreadable files. Download a summary you can reopen on the site anytime.',
  'hero.demo': 'See the demo',
  'demo.title': 'Everything the scan<br>detects for you',
  'demo.text': 'Conflicts, duplicates, encrypted files… and what to do about each one.',
  'demo.conflict': 'Conflict',
  'demo.dup': 'Duplicate',
  'demo.target': 'Target resource',
  'demo.unreadable': 'Unreadable file',
  'demo.recap': 'Summary',
  'demo.c1': 'version A', 'demo.c2': 'version B', 'demo.c3': 'Result', 'demo.c4': 'only 1 loaded',
  'demo.d1': 'Found in', 'demo.d2': '3 resources', 'demo.d3': 'Content', 'demo.d4': 'identical', 'demo.d5': 'Action', 'demo.d6': 'keep 1 copy',
  'demo.t1': 'Mapping A — conflicts with',
  'demo.u1': 'Header', 'demo.u2': 'unknown', 'demo.u3': 'Cause', 'demo.u4': 'encrypted or corrupted',
  'demo.l1': 'Resources', 'demo.l2': 'Advice', 'demo.l3': 'merge',
  'demo.r1': 'Conflicts', 'demo.r2': 'Invoiced', 'demo.r3': 'Reopen',
  'steps.title': '3 steps, 30 seconds',
  'steps.text': 'No install, no account. It runs right in your browser.',
  'steps.1t': 'Drop your folder', 'steps.1p': 'Your whole <code>resources</code> folder, or just <code>[maps]</code>. Nothing is uploaded, everything stays on your PC.',
  'steps.2t': 'The scan compares everything', 'steps.2p': 'Every file in the <code>stream</code> folder is compared: duplicates, different contents and encrypted files.',
  'steps.3t': 'Download the summary', 'steps.3p': 'Tick the pairs to invoice, download the HTML summary and reopen it on the site whenever you want.',
  'flow.1': 'Folder', 'flow.drop': 'Drop your <code>resources</code> folder',
  'flow.2': 'Conflicts', 'flow.f4': '4 files', 'flow.f2': '2 files', 'flow.f1': '1 file',
  'flow.3': 'Summary', 'flow.recap': 'Fix summary',
  'ba.title': 'Before / After',
  'ba.text': 'Drag the bar to compare a server before and after fixing its conflicts.',
  'ba.after': 'After fixing', 'ba.clean': 'Clean server', 'ba.before': 'Before fixing', 'ba.flicker': 'Flickering textures',
  'ba.conflicts': 'Conflicts', 'ba.dups': 'Duplicates', 'ba.unreadable': 'Unreadable',
  'ba.a1': '✓ single version', 'ba.a2': '✓ merged', 'ba.a3': '✓ copies removed',
  'ba.b1': '2 different versions', 'ba.b2': 'overridden by another map', 'ba.b3': 'copied 3 times',
  'ba.labelBefore': 'BEFORE', 'ba.labelAfter': 'AFTER',
  'feat.title': 'Built for mappers',
  'feat.1t': 'Real conflicts', 'feat.1p': 'Compares file contents: you know if it is a real collision or just a copy.',
  'feat.2t': 'Target resources', 'feat.2p': 'A mapping is bugging? See in one click which resources it conflicts with.',
  'feat.3t': 'Encrypted files', 'feat.3p': 'Every file is checked one by one: encrypted or corrupted ones get a padlock.',
  'feat.4t': 'Invoice summary', 'feat.4p': 'Tick the pairs to invoice, download the summary and reopen your scan in one click.',
  'partners.title': 'Our partners',
  'partners.text': 'The servers and creators we work with.',
  'reviews.title': 'They use it',
  'reviews.text': 'What servers that scanned their mappings say.',
  'faq.title': 'Frequently asked questions',
  'faq.1q': 'Are my files uploaded anywhere?',
  'faq.1a': 'No. The whole scan runs in your browser, nothing leaves your PC.',
  'faq.2q': 'What is the difference between “conflict” and “duplicate”?',
  'faq.2a': '<b>Duplicate</b>: the same file (identical content) is in several resources. You can delete the copies.<br><b>Conflict</b>: same file name but different content. FiveM only loads one version, the other is overridden.',
  'faq.3q': 'Which files are scanned?',
  'faq.3a': 'Only mapping files inside each resource’s <code>stream/</code> folder (<code>.ymap</code>, <code>.ytyp</code>, <code>.ydr</code>, <code>.ytd</code>, <code>.ybn</code>…). Files without the normal RAGE header get a padlock: encrypted, corrupted or badly exported.',
  'faq.4q': 'Which browser should I use?',
  'faq.4a': 'Chrome or Edge preferably: they handle dropping a whole folder best.',
  'cta.title': 'Ready to clean up your mappings?',
  'cta.text': 'One scan, one summary, and you know exactly what to fix.',

  // Scanner
  'title.scanner': 'Scanner — Shortt map / Fix',
  'sc.title': 'Scanner',
  'sc.text': 'Everything is analysed in your browser: no file is uploaded.',
  'sc.tour': 'Tutorial',
  'sc.drop': 'Drop your <code>resources</code> folder here',
  'sc.dropOr': 'or click to choose it',
  'sc.import': 'Reopen an .html summary',
  'sc.importOr': 'or drop it in the area above',
  'sc.target': 'Target resource',
  'sc.search': 'Search a resource…',
  'sc.multi': '<kbd>Ctrl</kbd> / <kbd>Shift</kbd> + click to pick several',
  'sc.clear': 'Clear all',
  'sc.rate': 'Rate / conflict (€)',
  'sc.export': 'Download summary',
};

// Textes générés par le scanner : [français, anglais]
const STR = {
  'play': ['Lecture', 'Play'],
  'pause': ['Pause', 'Pause'],

  'p.reading': ['Lecture du dossier…', 'Reading folder…'],
  'flow.found': ['{n} conflits trouvés', '{n} conflicts found'],
  'p.readingN': ['Lecture du dossier… {n} fichiers', 'Reading folder… {n} files'],
  'p.check': ['Vérification des fichiers… {n} / {total}', 'Checking files… {n} / {total}'],
  'p.hash': ['Comparaison des doublons… {n} / {total}', 'Comparing duplicates… {n} / {total}'],
  'p.done': ['Terminé', 'Done'],
  'p.noFiles': ['Aucun fichier trouvé dans ce dossier.', 'No files found in this folder.'],
  'p.noRes': ['Aucune ressource trouvée (pas de fxmanifest.lua). Glisse bien ton dossier resources.', 'No resources found (no fxmanifest.lua). Make sure you drop your resources folder.'],
  'p.finished': ['Terminé : {files} fichiers, {res} ressources analysées.', 'Done: {files} files, {res} resources scanned.'],
  'p.error': ['Erreur pendant le scan : {msg}', 'Error during scan: {msg}'],
  'p.restored': ['Scan du {date} restauré. Pour un nouveau scan, glisse ton dossier resources.', 'Scan from {date} restored. To scan again, drop your resources folder.'],
  'p.notRecap': ['Ce fichier n\'est pas un récap Shortt map / Fix.', 'This file is not a Shortt map / Fix summary.'],
  'p.badRecap': ['Impossible de lire ce récap : {msg}', 'Could not read this summary: {msg}'],
  'p.badLink': ['Lien de récap invalide ou incomplet : {msg}', 'Invalid or incomplete summary link: {msg}'],

  'reason.empty': ['Fichier vide', 'Empty file'],
  'reason.escrow': ['Chiffré (escrow)', 'Encrypted (escrow)'],
  'reason.unknown': ['En-tête inconnu : chiffré, corrompu ou mal exporté', 'Unknown header: encrypted, corrupted or badly exported'],

  'kind.model': ['Modèle', 'Model'],
  'kind.textures': ['Textures', 'Textures'],
  'kind.paths': ['Chemins', 'Paths'],
  'kind.scenario': ['Scénario', 'Scenario'],
  'kind.particles': ['Particules', 'Particles'],

  'sel.all': ['Toutes les ressources', 'All resources'],
  'sel.many': ['{n} ressources sélectionnées', '{n} resources selected'],
  'sel.one': ['1 sélectionnée', '1 selected'],
  'sel.n': ['{n} sélectionnées', '{n} selected'],
  'sel.none': ['Aucune ressource trouvée', 'No resource found'],
  'sel.toggle': ['Ajouter / retirer', 'Add / remove'],

  'st.res': ['Ressources scannées', 'Resources scanned'],
  'st.pairs': ['Conflits entre ressources', 'Conflicts between resources'],
  'st.files': ['Fichiers en conflit', 'Conflicting files'],
  'st.locked': ['Fichiers chiffrés', 'Encrypted files'],

  'r.title': ['Conflits par ressource', 'Conflicts by resource'],
  'r.titleOf': ['Conflits de {name}', 'Conflicts for {name}'],
  'r.nres': ['{n} ressources', '{n} resources'],
  'r.legend': ['= fichier chiffré ou illisible', '= encrypted or unreadable file'],
  'r.hint': ['Clique sur une ligne pour voir les fichiers. Coche les paires à mettre dans le récap.', 'Click a row to see its files. Tick the pairs to put in the summary.'],
  'r.inRecap': ['Dans le récap :', 'In summary:'],
  'r.checkAll': ['Tout cocher', 'Check all'],
  'r.uncheckAll': ['Tout décocher', 'Uncheck all'],
  'r.empty': ['Aucun conflit ✓', 'No conflicts ✓'],
  'r.locked': ['Fichiers chiffrés ou illisibles', 'Encrypted or unreadable files'],
  'r.file1': ['{n} fichier', '{n} file'],
  'r.fileN': ['{n} fichiers', '{n} files'],
  'r.identical': ['identique', 'identical'],
  'r.identicalTip': ['Même contenu dans les deux ressources', 'Same content in both resources'],
  'r.pickTip': ['Inclure dans le récap', 'Include in summary'],
  'r.lockTip': ['Verrouillé', 'Locked'],

  'x.docTitle': ['Récapitulatif des fix - Mapping FiveM', 'Fix summary - FiveM mapping'],
  'x.title': ['Récapitulatif des fix à facturer', 'Fix summary to invoice'],
  'x.reopen': ['↗ Rouvrir sur Shortt map / Fix', '↗ Reopen in Shortt map / Fix'],
  'x.target1': ['Ressource ciblée', 'Target resource'],
  'x.targetN': ['Ressources ciblées', 'Target resources'],
  'x.summary': ['{billed} conflit(s) facturé(s) sur {detected} détecté(s) &mdash; tarif : {rate} / conflit', '{billed} conflict(s) invoiced out of {detected} detected &mdash; rate: {rate} / conflict'],
  'x.none': ['Aucun conflit à facturer.', 'No conflicts to invoice.'],
  'x.notes': ['À noter', 'Notes'],
  'x.foot': ['Généré par Shortt map / Fix le {date}', 'Generated by Shortt map / Fix on {date}'],
  'x.file': ['recapitulatif_fix', 'fix_summary'],
  'x.all': ['toutes', 'all'],
  'x.error': ['Impossible de générer le récap : {msg}', 'Could not generate the summary: {msg}'],

  'tour.skip': ['Passer le tutoriel', 'Skip tutorial'],
  'tour.back': ['Retour', 'Back'],
  'tour.next': ['Suivant', 'Next'],
  'tour.finish': ['Terminer', 'Finish'],
  'tour.drop.t': ['Glisse ton dossier', 'Drop your folder'],
  'tour.drop.p': ['Dépose ton dossier resources (ou un sous-dossier comme [maps]) ici, ou clique pour le choisir. Rien n\'est envoyé, tout reste sur ton PC.', 'Drop your resources folder (or a subfolder like [maps]) here, or click to choose it. Nothing is uploaded, everything stays on your PC.'],
  'tour.help.t': ['Besoin d\'aide ?', 'Need help?'],
  'tour.help.p': ['Tu peux relancer ce tutoriel à tout moment avec ce bouton. La suite s\'affichera après ton premier scan.', 'You can restart this tutorial anytime with this button. The rest shows up after your first scan.'],
  'tour.stats.t': ['Le résumé', 'The overview'],
  'tour.stats.p': ['En rouge : ce qui pose problème. En orange : à vérifier. En vert : tout va bien.', 'Red: problems. Orange: to check. Green: all good.'],
  'tour.target.t': ['Cibler une ressource', 'Target a resource'],
  'tour.target.p': ['Choisis un mapping (le chiffre rouge = ses conflits). Ctrl ou Shift + clic pour en sélectionner plusieurs. L\'export ne contiendra que ceux-là.', 'Pick a mapping (red number = its conflicts). Ctrl or Shift + click to select several. The export will only contain those.'],
  'tour.report.t': ['Conflits par ressource', 'Conflicts by resource'],
  'tour.report.p': ['Une ligne = deux ressources en conflit. Clique dessus pour voir les fichiers, coche celles à facturer. Le cadenas indique un fichier chiffré.', 'One row = two conflicting resources. Click it to see the files, tick the ones to invoice. The padlock marks an encrypted file.'],
  'tour.export.t': ['Télécharger le récap', 'Download the summary'],
  'tour.export.p': ['Télécharge le récap HTML (seulement les paires cochées). Le bouton « Rouvrir » dedans te ramène ici avec tout ton scan.', 'Download the HTML summary (ticked pairs only). Its “Reopen” button brings you back here with your whole scan.'],
};

function t(key, vars) {
  const entry = STR[key];
  let s = entry ? entry[LANG === 'en' ? 1 : 0] : key;
  if (vars) s = s.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));
  return s;
}

const dateLocale = () => (LANG === 'en' ? 'en-GB' : 'fr-FR');

function applyLang() {
  document.documentElement.lang = LANG;
  // Le texte français d'origine est gardé dans data-fr (copié aussi quand un élément est cloné)
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    if (!el.hasAttribute('data-fr')) el.setAttribute('data-fr', el.innerHTML);
    const en = EN[el.dataset.i18n];
    el.innerHTML = LANG === 'en' && en !== undefined ? en : el.getAttribute('data-fr');
  });
  document.querySelectorAll('[data-i18n-ph]').forEach((el) => {
    if (!el.hasAttribute('data-fr-ph')) el.setAttribute('data-fr-ph', el.placeholder);
    const en = EN[el.dataset.i18nPh];
    el.placeholder = LANG === 'en' && en !== undefined ? en : el.getAttribute('data-fr-ph');
  });
  const titleKey = document.body.dataset.title;
  if (titleKey) {
    if (document._frTitle === undefined) document._frTitle = document.title;
    document.title = LANG === 'en' && EN[titleKey] ? EN[titleKey] : document._frTitle;
  }
  const label = document.getElementById('langLabel');
  if (label) label.textContent = LANG.toUpperCase();
  const btn = document.getElementById('langBtn');
  if (btn) btn.title = LANG === 'en' ? 'Passer en français' : 'Switch to English';
  document.dispatchEvent(new CustomEvent('langchange'));
}

/* ---------- Barre de navigation ---------- */
const discordLink = document.getElementById('discordLink');
if (discordLink) discordLink.href = SITE.discord;

const langBtn = document.getElementById('langBtn');
if (langBtn) {
  langBtn.addEventListener('click', () => {
    LANG = LANG === 'fr' ? 'en' : 'fr';
    try { localStorage.setItem('shortt_lang', LANG); } catch { /* stockage indisponible */ }
    applyLang();
  });
}

applyLang();
