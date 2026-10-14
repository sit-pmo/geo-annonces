/*
 * Annonces SIT dans les applications GEO
 * -------------------------------------
 * Bloc à coller tel quel dans le champ JavaScript de chaque application GEO.
 * Seule la constante APP change d'une application à l'autre.
 *
 * Fonctionnement :
 *  1. lit un fichier JSON public (SOURCE) contenant la liste des messages ;
 *  2. garde les messages actifs (dates) et destinés à cette application ;
 *  3. retire ceux que l'utilisateur a déjà fermés (mémorisés dans le navigateur) ;
 *  4. affiche les autres dans une fenêtre modale, l'un après l'autre.
 */
(function () {
  'use strict';

  // ── Paramètres ─────────────────────────────────────────────────────────
  var APP = 'urbanisme'; // identifiant de CETTE application (à adapter dans chaque appli)
  var SOURCE = 'https://raw.githubusercontent.com/sit-pmo/geo-annonces/main/annonces.json';
  var CLE_STOCKAGE = 'sit-pmo-annonces-fermees'; // clé localStorage des messages déjà fermés

  // ── Mémoire des messages fermés (try/catch : navigation privée, stockage bloqué) ──
  function lireFermes() {
    try { return JSON.parse(localStorage.getItem(CLE_STOCKAGE)) || []; }
    catch (e) { return []; }
  }
  function marquerFerme(id) {
    try {
      var ids = lireFermes();
      if (ids.indexOf(id) === -1) ids.push(id);
      localStorage.setItem(CLE_STOCKAGE, JSON.stringify(ids.slice(-50))); // ponytail: on ne garde que les 50 derniers ids
    } catch (e) { /* stockage indisponible : le message réapparaîtra au prochain chargement */ }
  }

  // ── Filtre : message actif, destiné à cette appli, pas encore fermé ──────
  function aAfficher(m, aujourdhui, fermes) {
    if (!m || !m.id || !m.texte) return false;
    if (m.debut && aujourdhui < m.debut) return false; // dates au format AAAA-MM-JJ : comparaison de chaînes suffisante
    if (m.fin && aujourdhui > m.fin) return false;
    var apps = m.apps || ['*'];
    if (apps.indexOf('*') === -1 && apps.indexOf(APP) === -1) return false;
    return fermes.indexOf(m.id) === -1;
  }

  // ── Styles (injectés une seule fois, préfixe .sitpmo- pour ne pas toucher à GEO) ──
  function injecterStyles() {
    var css =
      '.sitpmo-overlay{position:fixed;inset:0;z-index:10000;background:rgba(107,107,107,.6);' +
      'display:flex;align-items:center;justify-content:center;padding:16px;' +
      'font-family:"Public Sans",-apple-system,BlinkMacSystemFont,sans-serif;font-size:14px;' +
      'animation:sitpmo-fondu 200ms cubic-bezier(.2,0,0,1) both}' +
      '.sitpmo-modale{width:min(560px,100%);max-height:calc(100vh - 32px);display:flex;flex-direction:column;' +
      'background:#fff;color:#003E50;border:1px solid #E6EBEE;border-radius:14px;overflow:hidden;' +
      'box-shadow:0 8px 24px rgb(0 82 103 / .12),0 1px 4px rgb(0 82 103 / .07);' +
      'animation:sitpmo-in 200ms cubic-bezier(.2,0,0,1) both}' +
      '.sitpmo-entete{display:flex;align-items:center;gap:12px;padding:16px;background:#005267;color:#fff;flex-shrink:0}' +
      '.sitpmo-modale.alerte .sitpmo-entete{background:#C2410C}' +
      '.sitpmo-titre{flex:1;margin:0;font-size:17px;font-weight:600;line-height:1.2}' +
      '.sitpmo-x{width:30px;height:30px;flex-shrink:0;border:1px solid rgb(255 255 255 / .25);border-radius:6px;' +
      'background:transparent;color:#fff;cursor:pointer;font-size:18px;line-height:1}' +
      '.sitpmo-x:hover{background:rgb(255 255 255 / .15)}' +
      '.sitpmo-corps{padding:16px;overflow-y:auto;line-height:1.5}' +
      '.sitpmo-corps img{display:block;max-width:100%;height:auto;margin:0 auto 12px;border-radius:10px}' +
      '.sitpmo-corps p{margin:0 0 10px}' +
      '.sitpmo-pied{display:flex;justify-content:flex-end;align-items:center;gap:12px;padding:12px 16px;' +
      'background:#FAFCFD;border-top:1px solid #E6EBEE;flex-shrink:0}' +
      '.sitpmo-pied a{color:#005267;font-weight:600}' +
      '.sitpmo-ok{font-family:inherit;font-size:11px;font-weight:600;letter-spacing:.05em;text-transform:uppercase;color:#fff;' +
      'background:#005267;border:1px solid #005267;border-radius:6px;padding:8px 16px;cursor:pointer}' +
      '.sitpmo-ok:hover{background:#003E50}' +
      '.sitpmo-x:focus-visible,.sitpmo-ok:focus-visible{outline:none;box-shadow:0 0 0 2px #fff,0 0 0 4px #08B8DC}' +
      '@keyframes sitpmo-fondu{from{opacity:0}to{opacity:1}}' +
      '@keyframes sitpmo-in{from{opacity:0;transform:translateY(-8px) scale(.98)}to{opacity:1;transform:none}}';
    var style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
  }

  // Petit utilitaire : crée un élément avec une classe et un texte (jamais de HTML interprété)
  function el(tag, classe, texte) {
    var e = document.createElement(tag);
    if (classe) e.className = classe;
    if (texte) e.textContent = texte;
    return e;
  }

  // ── Affichage d'un message dans une modale ; suivant() est appelé à la fermeture ──
  function afficher(m, suivant) {
    var overlay = el('div', 'sitpmo-overlay');
    var modale = el('div', 'sitpmo-modale' + (m.niveau === 'alerte' ? ' alerte' : ''));
    modale.setAttribute('role', 'dialog');
    modale.setAttribute('aria-modal', 'true');
    modale.setAttribute('aria-labelledby', 'sitpmo-titre');

    // En-tête : titre + croix
    var entete = el('div', 'sitpmo-entete');
    var titre = el('h2', 'sitpmo-titre', m.titre || 'Information');
    titre.id = 'sitpmo-titre';
    var x = el('button', 'sitpmo-x', '×');
    x.type = 'button';
    x.setAttribute('aria-label', 'Fermer');
    entete.appendChild(titre);
    entete.appendChild(x);

    // Corps : image optionnelle (http(s) uniquement) puis un paragraphe par élément / ligne du texte
    // (texte accepté sous forme de chaîne avec \n ou de liste de paragraphes)
    var corps = el('div', 'sitpmo-corps');
    if (m.image && /^https?:\/\//i.test(m.image)) {
      var img = el('img');
      img.src = m.image;
      img.alt = m.imageAlt || '';
      corps.appendChild(img);
    }
    [].concat(m.texte).join('\n').split(/\n+/).forEach(function (ligne) { corps.appendChild(el('p', '', ligne)); });

    // Pied : lien optionnel (http(s) uniquement) + bouton de fermeture
    var pied = el('div', 'sitpmo-pied');
    if (m.lien && /^https?:\/\//i.test(m.lien)) {
      var a = el('a', '', m.lienTexte || 'En savoir plus');
      a.href = m.lien;
      a.target = '_blank';
      a.rel = 'noopener';
      pied.appendChild(a);
    }
    var ok = el('button', 'sitpmo-ok', "J'ai compris");
    ok.type = 'button';
    pied.appendChild(ok);

    modale.appendChild(entete);
    modale.appendChild(corps);
    modale.appendChild(pied);
    overlay.appendChild(modale);

    // Fermeture : croix, bouton, clic sur le fond ou Échap → message mémorisé comme lu
    function fermer() {
      marquerFerme(m.id);
      document.removeEventListener('keydown', surTouche);
      overlay.remove();
      suivant();
    }
    function surTouche(e) { if (e.key === 'Escape') fermer(); }
    x.addEventListener('click', fermer);
    ok.addEventListener('click', fermer);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) fermer(); });
    document.addEventListener('keydown', surTouche);

    document.body.appendChild(overlay);
    ok.focus();
  }

  // ── Démarrage ────────────────────────────────────────────────────────────
  function demarrer() {
    fetch(SOURCE, { cache: 'no-store' })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (data) {
        var aujourdhui = new Date().toLocaleDateString('sv-SE'); // date locale au format AAAA-MM-JJ
        var fermes = lireFermes();
        var file = (data.messages || []).filter(function (m) { return aAfficher(m, aujourdhui, fermes); });
        if (!file.length) return;

        injecterStyles();
        // Une modale à la fois : la fermeture de l'une ouvre la suivante
        (function prochain() { if (file.length) afficher(file.shift(), prochain); })();
      })
      // Source injoignable ou JSON invalide : l'application doit fonctionner normalement, on se tait
      .catch(function (e) { console.warn('[annonces SIT] ' + e.message); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', demarrer);
  else demarrer();
})();
