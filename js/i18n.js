/* ==========================================================================
   FERRON — Internationalization (i18n)
   Supports: DE, EN, FR, PL, ES
   ========================================================================== */

const I18n = (() => {
    'use strict';

    const LANGS = ['de', 'en', 'fr', 'pl', 'es'];
    const FLAGS = { de: 'DE', en: 'EN', fr: 'FR', pl: 'PL', es: 'ES' };

    // ========================================================================
    // TRANSLATIONS
    // ========================================================================
    const T = {
        // Navigation
        'nav.services':       { de:'Leistungen', en:'Services', fr:'Services', pl:'Usługi', es:'Servicios' },
        'nav.configurator':   { de:'Konfigurator', en:'Profile Configurator', fr:'Configurateur', pl:'Konfigurator', es:'Configurador' },
        'nav.process':        { de:'Ablauf', en:'How It Works', fr:'Processus', pl:'Proces', es:'Proceso' },
        'nav.about':          { de:'Über uns', en:'About', fr:'À propos', pl:'O nas', es:'Nosotros' },
        'nav.quote':          { de:'Angebot anfragen', en:'Request Quote', fr:'Demander un devis', pl:'Zapytaj o ofertę', es:'Solicitar presupuesto' },

        // Hero
        'hero.badge':         { de:'Stahl- & Aluminiumprofil-Handel', en:'Steel & Aluminum Profile Trading', fr:'Négoce de profilés acier & aluminium', pl:'Handel profilami stalowymi i aluminiowymi', es:'Comercio de perfiles de acero y aluminio' },
        'hero.title1':        { de:'Präzisionsprofile.', en:'Precision Profiles.', fr:'Profilés de précision.', pl:'Profile precyzyjne.', es:'Perfiles de precisión.' },
        'hero.title2':        { de:'Moderne Lösungen.', en:'Modern Solutions.', fr:'Solutions modernes.', pl:'Nowoczesne rozwiązania.', es:'Soluciones modernas.' },
        'hero.subtitle':      {
            de:'Wir beschaffen, konfigurieren und liefern Stahl- und Aluminiumprofile nach höchsten Ingenieurstandards. Von Standard-IPE-Trägern bis zu kundenspezifischen Strangpressprofilen — erhalten Sie sofortige Angebote und zuverlässige Lieferung.',
            en:'We source, configure, and deliver structural steel and aluminum profiles with precision engineering standards. From standard IPE beams to custom extrusion profiles — get instant quotes and reliable supply.',
            fr:'Nous sourçons, configurons et livrons des profilés en acier et aluminium selon les normes d\'ingénierie les plus strictes. Des poutrelles IPE standard aux profilés d\'extrusion sur mesure.',
            pl:'Dostarczamy, konfigurujemy i realizujemy zamówienia na profile stalowe i aluminiowe zgodnie z najwyższymi standardami inżynieryjnymi.',
            es:'Suministramos, configuramos y entregamos perfiles de acero y aluminio con estándares de ingeniería de precisión.',
        },
        'hero.cta.configure':   { de:'Profil konfigurieren', en:'Configure Profile', fr:'Configurer un profilé', pl:'Konfiguruj profil', es:'Configurar perfil' },
        'hero.cta.contact':     { de:'Kontakt aufnehmen', en:'Get in Touch', fr:'Nous contacter', pl:'Skontaktuj się', es:'Contactar' },
        'hero.stat.profiles':   { de:'Profiltypen', en:'Profile Types', fr:'Types de profilés', pl:'Typów profili', es:'Tipos de perfiles' },
        'hero.stat.materials':  { de:'Werkstoffe', en:'Material Grades', fr:'Nuances', pl:'Gatunków', es:'Grados' },
        'hero.stat.turnaround': { de:'Angebotszeit', en:'Quote Turnaround', fr:'Délai de devis', pl:'Czas oferty', es:'Tiempo de oferta' },

        // Services
        'services.tag':        { de:'Was wir tun', en:'What We Do', fr:'Nos services', pl:'Co robimy', es:'Qué hacemos' },
        'services.title':      { de:'Effiziente Beschaffung\nvon Metallprofilen', en:'Streamlined Metal\nProfile Sourcing', fr:'Approvisionnement\noptimisé de profilés', pl:'Usprawnione\nzaopatrzenie w profile', es:'Suministro optimizado\nde perfiles metálicos' },
        'services.desc':       {
            de:'Wir verbinden Ihre Projektanforderungen mit Präzisionsfertigung. Keine Lagerhaltung, kein Overhead — nur zuverlässige Lieferketten-Expertise.',
            en:'We bridge the gap between your project requirements and precision manufacturing. No warehouses, no overhead — just reliable supply chain expertise.',
            fr:'Nous faisons le lien entre vos besoins et la fabrication de précision. Pas d\'entrepôts, pas de frais généraux — juste une expertise fiable.',
            pl:'Łączymy Twoje wymagania projektowe z precyzyjną produkcją. Bez magazynów, bez zbędnych kosztów.',
            es:'Conectamos sus requisitos con la fabricación de precisión. Sin almacenes, sin gastos generales — solo experiencia fiable.',
        },
        'services.s1.title':   { de:'Profilkonfiguration', en:'Profile Configuration', fr:'Configuration de profilés', pl:'Konfiguracja profili', es:'Configuración de perfiles' },
        'services.s1.desc':    {
            de:'Nutzen Sie unseren interaktiven Konfigurator für exakte Profiltypen, Maße, Werkstoffe und Oberflächen. Sofortige Gewichts- und Preiskalkulationen für Standard- und Strangpressprofile.',
            en:'Use our interactive configurator to specify exact profile types, dimensions, materials, and finishes. Get instant weight calculations and price estimates for both standard and custom extrusion profiles.',
            fr:'Utilisez notre configurateur interactif pour spécifier types, dimensions, matériaux et finitions. Calculs de poids et estimations de prix instantanés.',
            pl:'Użyj naszego konfiguratora do określenia typów profili, wymiarów, materiałów i wykończeń. Natychmiastowe kalkulacje wagi i cen.',
            es:'Use nuestro configurador interactivo para especificar tipos de perfiles, dimensiones, materiales y acabados. Cálculos de peso y estimaciones de precio instantáneos.',
        },
        'services.s2.title':   { de:'Stahlbeschaffung & Logistik', en:'Steel Sourcing & Logistics', fr:'Approvisionnement acier', pl:'Dostawy stali i logistyka', es:'Suministro de acero' },
        'services.s2.desc':    {
            de:'Stahlprofile (IPE, HEA, UPN, Hohlprofile) von zertifizierten europäischen Walzwerken. Wir übernehmen Beschaffung, Qualitätssicherung und Logistik — Sie erhalten die Profile frei Baustelle.',
            en:'Structural steel profiles (IPE, HEA, UPN, hollow sections) sourced from certified European rolling mills. We handle procurement, quality assurance, and logistics — you get the profiles delivered to your site.',
            fr:'Profilés acier (IPE, HEA, UPN, sections creuses) des laminoirs européens certifiés. Nous gérons approvisionnement, qualité et logistique.',
            pl:'Profile stalowe (IPE, HEA, UPN, profile zamknięte) z certyfikowanych europejskich walcowni. Zajmujemy się zakupem, kontrolą jakości i logistyką.',
            es:'Perfiles de acero (IPE, HEA, UPN, secciones huecas) de laminadores europeos certificados. Nos encargamos de compras, calidad y logística.',
        },
        'services.s3.title':   { de:'Aluminium-Strangpressung', en:'Aluminum Extrusion', fr:'Extrusion d\'aluminium', pl:'Wytłaczanie aluminium', es:'Extrusión de aluminio' },
        'services.s3.desc':    {
            de:'Individuelle Aluminiumprofile auf einer der modernsten mittelgroßen Strangpressen Europas. Von Fensterprofilen bis zu Kühlkörpern und Industrieprofilen — zeichnen Sie Ihr Profil, wir fertigen es.',
            en:'Custom aluminum profiles manufactured on one of Europe\'s most modern mid-sized extrusion presses. From window frames to heatsinks and industrial profiles — draw your cross-section, we\'ll produce it.',
            fr:'Profilés aluminium sur mesure fabriqués sur l\'une des presses d\'extrusion les plus modernes d\'Europe. Fenêtres, dissipateurs, profilés industriels — dessinez, nous produisons.',
            pl:'Niestandardowe profile aluminiowe produkowane na jednej z najnowocześniejszych pras w Europie. Od profili okiennych po radiatory — narysuj przekrój, my go wyprodukujemy.',
            es:'Perfiles de aluminio personalizados fabricados en una de las prensas de extrusión más modernas de Europa. Desde ventanas hasta disipadores — dibuje su perfil, nosotros lo producimos.',
        },
        'services.s4.title':   { de:'Qualitätszertifikate', en:'Quality Certificates', fr:'Certificats de qualité', pl:'Certyfikaty jakości', es:'Certificados de calidad' },
        'services.s4.desc':    {
            de:'Jede Lieferung enthält EN 10204 Werkszeugnisse (2.1, 3.1 oder 3.2), Maßprotokolle und vollständige Rückverfolgbarkeit.',
            en:'Every delivery includes EN 10204 material certificates (2.1, 3.1, or 3.2), dimensional inspection reports, and full traceability documentation.',
            fr:'Chaque livraison comprend les certificats EN 10204 (2.1, 3.1 ou 3.2), les rapports dimensionnels et la traçabilité complète.',
            pl:'Każda dostawa zawiera świadectwa EN 10204 (2.1, 3.1 lub 3.2), protokoły pomiarowe i pełną dokumentację.',
            es:'Cada entrega incluye certificados EN 10204 (2.1, 3.1 o 3.2), informes dimensionales y documentación de trazabilidad completa.',
        },

        // Configurator
        'config.tag':           { de:'Interaktives Tool', en:'Interactive Tool', fr:'Outil interactif', pl:'Narzędzie interaktywne', es:'Herramienta interactiva' },
        'config.title':         { de:'Profil-Konfigurator', en:'Profile Configurator', fr:'Configurateur de profilés', pl:'Konfigurator profili', es:'Configurador de perfiles' },
        'config.desc':          {
            de:'Wählen Sie einen Profiltyp, passen Sie Abmessungen an, wählen Sie Ihr Material — erhalten Sie eine sofortige Schätzung. Alle Profile entsprechen EN/DIN-Normen.',
            en:'Select a profile type, adjust dimensions to standard sizes, choose your material — get an instant estimate. All profiles comply with EN/DIN standards.',
            fr:'Sélectionnez un type de profilé, ajustez les dimensions, choisissez votre matériau — obtenez une estimation instantanée.',
            pl:'Wybierz typ profilu, dostosuj wymiary, wybierz materiał — otrzymaj natychmiastową wycenę.',
            es:'Seleccione un tipo de perfil, ajuste dimensiones, elija su material — obtenga un presupuesto instantáneo.',
        },
        'config.tab.standard':  { de:'Standardprofile', en:'Standard Profiles', fr:'Profilés standard', pl:'Profile standardowe', es:'Perfiles estándar' },
        'config.tab.standard.note': { de:'Stahl & Aluminium', en:'Steel & Aluminum', fr:'Acier & Aluminium', pl:'Stal i aluminium', es:'Acero y aluminio' },
        'config.tab.custom':    { de:'Kundenspezifisch', en:'Custom Profile', fr:'Profilé sur mesure', pl:'Profil niestandardowy', es:'Perfil personalizado' },
        'config.tab.custom.note': { de:'Aluminium-Strangpressung', en:'Aluminum Extrusion', fr:'Extrusion d\'aluminium', pl:'Wytłaczanie aluminium', es:'Extrusión de aluminio' },
        'config.std.note':      {
            de:'Standard-Stahlprofile (IPE, HEA, UPN, Hohlprofile) werden von zertifizierten europäischen Walzwerken bezogen. Aluminium-Standardprofile sind ab Lager oder aus Produktion verfügbar. Für kundenspezifische Aluminium-Strangpressprofile wechseln Sie zum Tab <strong>Kundenspezifisch</strong>.',
            en:'Standard steel profiles (IPE, HEA, UPN, hollow sections) are sourced from certified European mills. Aluminum standard profiles are available from stock or production. For custom aluminum extrusion profiles, switch to the <strong>Custom Profile</strong> tab.',
            fr:'Les profilés acier standard (IPE, HEA, UPN, sections creuses) sont approvisionnés auprès de laminoirs européens certifiés. Pour les profilés aluminium sur mesure, utilisez l\'onglet <strong>Profilé sur mesure</strong>.',
            pl:'Standardowe profile stalowe (IPE, HEA, UPN, profile zamknięte) pozyskiwane są z certyfikowanych europejskich walcowni. Dla niestandardowych profili aluminiowych przejdź do zakładki <strong>Profil niestandardowy</strong>.',
            es:'Los perfiles de acero estándar (IPE, HEA, UPN, secciones huecas) se obtienen de laminadores europeos certificados. Para perfiles de aluminio personalizados, cambie a la pestaña <strong>Perfil personalizado</strong>.',
        },
        'config.cc.badge':      {
            de:'Nur Aluminium-Strangpressung — Individuelle Profile auf unserer Presse gefertigt (max. ⌀ 300 mm)',
            en:'Aluminum Extrusion Only — Custom profiles produced on our press (max. ⌀ 300 mm)',
            fr:'Extrusion aluminium uniquement — Profilés sur mesure fabriqués sur notre presse (max. ⌀ 300 mm)',
            pl:'Tylko wytłaczanie aluminium — Profile niestandardowe produkowane na naszej prasie (maks. ⌀ 300 mm)',
            es:'Solo extrusión de aluminio — Perfiles personalizados producidos en nuestra prensa (máx. ⌀ 300 mm)',
        },

        // Process
        'process.tag':         { de:'Einfach & Transparent', en:'Simple & Transparent', fr:'Simple & Transparent', pl:'Prosto i przejrzyście', es:'Simple y transparente' },
        'process.title':       { de:'So funktioniert es', en:'How It Works', fr:'Comment ça marche', pl:'Jak to działa', es:'Cómo funciona' },
        'process.s1.title':    { de:'Konfigurieren', en:'Configure', fr:'Configurer', pl:'Konfiguruj', es:'Configurar' },
        'process.s2.title':    { de:'Angebot', en:'Quote', fr:'Devis', pl:'Oferta', es:'Presupuesto' },
        'process.s3.title':    { de:'Fertigung', en:'Produce', fr:'Produire', pl:'Produkcja', es:'Producir' },
        'process.s4.title':    { de:'Lieferung', en:'Deliver', fr:'Livrer', pl:'Dostawa', es:'Entregar' },

        // About
        'about.tag':           { de:'Über FERRON', en:'About FERRON', fr:'À propos de FERRON', pl:'O firmie FERRON', es:'Sobre FERRON' },
        'about.title':         { de:'Aufgebaut auf Jahrzehnten\nFertigungs-Know-how', en:'Built on Decades of\nManufacturing Expertise', fr:'Fondé sur des décennies\nd\'expertise manufacturière', pl:'Zbudowane na dekadach\ndoświadczenia produkcyjnego', es:'Construido sobre décadas\nde experiencia industrial' },

        // Contact
        'contact.tag':         { de:'Loslegen', en:'Get Started', fr:'Commencer', pl:'Rozpocznij', es:'Empezar' },
        'contact.title':       { de:'Angebot anfragen', en:'Request a Quote', fr:'Demander un devis', pl:'Zapytaj o ofertę', es:'Solicitar presupuesto' },
        'contact.desc':        {
            de:'Senden Sie uns Ihre Anforderungen und wir antworten innerhalb von 48 Stunden mit einem detaillierten Angebot.',
            en:'Send us your requirements and we\'ll respond with a detailed offer within 48 hours.',
            fr:'Envoyez-nous vos exigences et nous vous répondrons avec une offre détaillée sous 48 heures.',
            pl:'Wyślij nam swoje wymagania, a odpowiemy szczegółową ofertą w ciągu 48 godzin.',
            es:'Envíenos sus requisitos y le responderemos con una oferta detallada en 48 horas.',
        },
        'contact.name':        { de:'Vollständiger Name', en:'Full Name', fr:'Nom complet', pl:'Imię i nazwisko', es:'Nombre completo' },
        'contact.company':     { de:'Unternehmen', en:'Company', fr:'Entreprise', pl:'Firma', es:'Empresa' },
        'contact.email':       { de:'E-Mail', en:'Email', fr:'E-mail', pl:'E-mail', es:'Correo electrónico' },
        'contact.phone':       { de:'Telefon', en:'Phone', fr:'Téléphone', pl:'Telefon', es:'Teléfono' },
        'contact.subject':     { de:'Betreff', en:'Subject', fr:'Objet', pl:'Temat', es:'Asunto' },
        'contact.message':     { de:'Nachricht', en:'Message', fr:'Message', pl:'Wiadomość', es:'Mensaje' },
        'contact.send':        { de:'Anfrage senden', en:'Send Inquiry', fr:'Envoyer', pl:'Wyślij zapytanie', es:'Enviar consulta' },
        'contact.privacy':     { de:'Ich stimme der Verarbeitung meiner Daten zu.', en:'I agree to the processing of my data for the purpose of receiving a quote.', fr:'J\'accepte le traitement de mes données.', pl:'Wyrażam zgodę na przetwarzanie moich danych.', es:'Acepto el procesamiento de mis datos.' },

        // Custom configurator
        'cc.templates':        { de:'Vorlage wählen', en:'Choose Template', fr:'Choisir un modèle', pl:'Wybierz szablon', es:'Elegir plantilla' },
        'cc.toolbar.outer':    { de:'Außenkontur zeichnen', en:'Draw Outer Contour', fr:'Dessiner contour ext.', pl:'Rysuj kontur zewn.', es:'Dibujar contorno ext.' },
        'cc.toolbar.hollow':   { de:'Hohlraum (Polygon)', en:'Add Hollow (Polygon)', fr:'Ajouter creux (polygone)', pl:'Dodaj otwór (wielokąt)', es:'Añadir hueco (polígono)' },
        'cc.toolbar.rect':     { de:'Hohlraum (Rechteck)', en:'Add Hollow (Rectangle)', fr:'Ajouter creux (rectangle)', pl:'Dodaj otwór (prostokąt)', es:'Añadir hueco (rectángulo)' },
        'cc.toolbar.select':   { de:'Auswählen / Verschieben', en:'Select / Move', fr:'Sélectionner / Déplacer', pl:'Wybierz / Przesuń', es:'Seleccionar / Mover' },
        'cc.grid':             { de:'Raster', en:'Grid', fr:'Grille', pl:'Siatka', es:'Cuadrícula' },
        'cc.snap':             { de:'Einrasten', en:'Snap', fr:'Aimanter', pl:'Przyciągaj', es:'Ajustar' },

        // Footer
        'footer.tagline':      { de:'Präzise Metallprofilbeschaffung für die moderne Industrie.', en:'Precision metal profile sourcing for modern industry.', fr:'Approvisionnement de profilés métalliques de précision.', pl:'Precyzyjne dostawy profili metalowych.', es:'Suministro de perfiles metálicos de precisión.' },
    };

    let currentLang = 'de'; // Default German

    function setLanguage(lang) {
        if (!LANGS.includes(lang)) return;
        currentLang = lang;
        localStorage.setItem('ferron-lang', lang);

        // Update all elements with data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const translation = T[key];
            if (translation && translation[lang]) {
                // Handle newlines in translations
                if (el.tagName === 'BR') return;
                if (translation[lang].includes('\n')) {
                    el.innerHTML = translation[lang].replace(/\n/g, '<br>');
                } else if (/<[a-z][\s\S]*>/i.test(translation[lang])) {
                    // Translation contains HTML tags (e.g. <strong>)
                    el.innerHTML = translation[lang];
                } else {
                    el.textContent = translation[lang];
                }
            }
        });

        // Update placeholder attributes
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            const translation = T[key];
            if (translation && translation[lang]) {
                el.placeholder = translation[lang];
            }
        });

        // Update active language in switcher
        document.querySelectorAll('.lang-option').forEach(el => {
            el.classList.toggle('active', el.dataset.lang === lang);
        });

        // Update html lang attribute
        document.documentElement.lang = lang;
    }

    function init() {
        // Detect preferred language
        const saved = localStorage.getItem('ferron-lang');
        const browser = navigator.language?.slice(0, 2);

        if (saved && LANGS.includes(saved)) {
            currentLang = saved;
        } else if (browser && LANGS.includes(browser)) {
            currentLang = browser;
        } else {
            currentLang = 'de'; // Default to German
        }

        // Bind language switcher
        document.querySelectorAll('.lang-option').forEach(el => {
            el.addEventListener('click', (e) => {
                e.preventDefault();
                setLanguage(el.dataset.lang);
            });
        });

        setLanguage(currentLang);
    }

    return { init, setLanguage, t: (key) => T[key]?.[currentLang] || key };
})();

document.addEventListener('DOMContentLoaded', I18n.init);
