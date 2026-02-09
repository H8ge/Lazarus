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
        'nav.specs':          { de:'Technik', en:'Specs', fr:'Technique', pl:'Technika', es:'Técnico' },
        'nav.about':          { de:'Über uns', en:'About', fr:'À propos', pl:'O nas', es:'Nosotros' },
        'nav.quote':          { de:'Angebot anfragen', en:'Request Quote', fr:'Demander un devis', pl:'Zapytaj o ofertę', es:'Solicitar presupuesto' },

        // Hero
        'hero.badge':         { de:'Beschaffungsspezialist — Direkter Zugang zu zertifizierten Produzenten', en:'Sourcing Specialist — Direct Access to Certified Producers', fr:'Spécialiste approvisionnement — Accès direct aux producteurs certifiés', pl:'Specjalista zaopatrzenia — Bezpośredni dostęp do certyfikowanych producentów', es:'Especialista en suministro — Acceso directo a productores certificados' },
        'hero.title1':        { de:'Aluminium- & Stahlprofile.', en:'Aluminum & Steel Profiles.', fr:'Profilés aluminium & acier.', pl:'Profile aluminiowe i stalowe.', es:'Perfiles de aluminio y acero.' },
        'hero.title2':        { de:'Einfach beschafft.', en:'Simply sourced.', fr:'Simplement approvisionné.', pl:'Prosto dostarczone.', es:'Simplemente adquirido.' },
        'hero.subtitle':      {
            de:'Wir verbinden Sie mit führenden europäischen Produzenten für Strangpressprofile und Walzstahl. Sie konfigurieren, wir beschaffen — von der Einzelanfrage bis zur Serienfertigung. EN 10204 Zeugnisse. Technische Beratung. Schnelle Angebote.',
            en:'We connect you with leading European producers for extrusion profiles and rolled steel. You configure, we source — from single inquiries to series production. EN 10204 certificates. Technical consultation. Fast quotes.',
            fr:'Nous vous connectons aux principaux producteurs européens de profilés extrudés et d\'acier laminé. Vous configurez, nous approvisionnons. Certificats EN 10204. Conseil technique. Devis rapides.',
            pl:'Łączymy Cię z wiodącymi europejskimi producentami profili wytłaczanych i stali walcowanej. Ty konfigurujesz, my dostarczamy. Świadectwa EN 10204. Doradztwo techniczne. Szybkie oferty.',
            es:'Le conectamos con los principales productores europeos de perfiles extruidos y acero laminado. Usted configura, nosotros suministramos. Certificados EN 10204. Asesoría técnica. Presupuestos rápidos.',
        },
        'hero.cta.configure':   { de:'Profil konfigurieren', en:'Configure Profile', fr:'Configurer un profilé', pl:'Konfiguruj profil', es:'Configurar perfil' },
        'hero.cta.contact':     { de:'Anfrage senden', en:'Send Inquiry', fr:'Envoyer une demande', pl:'Wyślij zapytanie', es:'Enviar consulta' },
        'hero.stat.quote':      { de:'Angebotszeit', en:'Quote Time', fr:'Délai de devis', pl:'Czas oferty', es:'Tiempo de cotización' },
        'hero.stat.profiles':   { de:'Profiltypen', en:'Profile Types', fr:'Types de profilés', pl:'Typy profili', es:'Tipos de perfiles' },
        'hero.stat.sourcing':   { de:'Zertifizierte Werke', en:'Certified Mills', fr:'Usines certifiées', pl:'Certyfikowane zakłady', es:'Fábricas certificadas' },

        // Services
        'services.tag':        { de:'Unser Service', en:'Our Service', fr:'Notre service', pl:'Nasze usługi', es:'Nuestro servicio' },
        'services.title':      { de:'Beschaffung\nohne Umwege', en:'Sourcing\nWithout Detours', fr:'Approvisionnement\nsans détours', pl:'Zaopatrzenie\nbez pośredników', es:'Suministro\nsin rodeos' },
        'services.desc':       {
            de:'Wir arbeiten direkt mit zertifizierten europäischen Strangpresswerken und Walzereien zusammen. Sie spezifizieren, wir kümmern uns um den Rest — von der technischen Klärung bis zur Lieferung.',
            en:'We work directly with certified European extrusion mills and rolling plants. You specify, we handle the rest — from technical clarification to delivery.',
            fr:'Nous travaillons directement avec des usines d\'extrusion et laminoirs européens certifiés. Vous spécifiez, nous gérons le reste — de la clarification technique à la livraison.',
            pl:'Współpracujemy bezpośrednio z certyfikowanymi europejskimi zakładami wytłaczania i walcowniami. Ty specyfikujesz, my zajmujemy się resztą.',
            es:'Trabajamos directamente con plantas de extrusión y laminación europeas certificadas. Usted especifica, nosotros nos encargamos del resto.',
        },
        'services.s1.title':   { de:'Profil-Konfigurator', en:'Profile Configurator', fr:'Configurateur de profilés', pl:'Konfigurator profili', es:'Configurador de perfiles' },
        'services.s1.desc':    {
            de:'Nutzen Sie unseren interaktiven Konfigurator für exakte Profiltypen, Maße, Werkstoffe und Oberflächen. Sofortige Gewichts- und Preisschätzung für Standard- und Sonderprofile.',
            en:'Use our interactive configurator for exact profile types, dimensions, materials and finishes. Instant weight and price estimates for standard and custom profiles.',
            fr:'Utilisez notre configurateur interactif pour les types de profilés, dimensions, matériaux et finitions. Estimations instantanées de poids et prix.',
            pl:'Użyj naszego interaktywnego konfiguratora dla dokładnych typów profili, wymiarów, materiałów i wykończeń. Natychmiastowe szacunki wagi i ceny.',
            es:'Use nuestro configurador interactivo para tipos exactos de perfiles, dimensiones, materiales y acabados. Estimaciones instantáneas de peso y precio.',
        },
        'services.s2.title':   { de:'Beschaffung & Logistik', en:'Sourcing & Logistics', fr:'Approvisionnement & Logistique', pl:'Zaopatrzenie i logistyka', es:'Suministro y logística' },
        'services.s2.desc':    {
            de:'Strangpressprofile und Stahlprofile von zertifizierten europäischen Werken. Wir übernehmen Beschaffung, Qualitätskontrolle und Logistik — frei Haus oder ab Werk.',
            en:'Extrusion profiles and steel profiles from certified European mills. We handle sourcing, quality control and logistics — delivered or ex-works.',
            fr:'Profilés d\'extrusion et d\'acier de usines européennes certifiées. Nous gérons l\'approvisionnement, le contrôle qualité et la logistique.',
            pl:'Profile wytłaczane i stalowe z certyfikowanych europejskich zakładów. Obsługujemy zaopatrzenie, kontrolę jakości i logistykę.',
            es:'Perfiles de extrusión y acero de fábricas europeas certificadas. Gestionamos suministro, control de calidad y logística.',
        },
        'services.s3.title':   { de:'Schnelle Angebote', en:'Fast Quotes', fr:'Devis rapides', pl:'Szybkie oferty', es:'Presupuestos rápidos' },
        'services.s3.desc':    {
            de:'Verbindliche Angebote innerhalb von 48 Stunden. Kurze Kommunikationswege, direkte Ansprechpartner, keine Wartezeiten. Angebotsvalidität 14 Tage.',
            en:'Binding quotes within 48 hours. Short communication channels, direct contacts, no waiting. Quote validity 14 days.',
            fr:'Devis contraignants sous 48 heures. Canaux courts, contacts directs, pas d\'attente. Validité 14 jours.',
            pl:'Wiążące oferty w ciągu 48 godzin. Krótkie kanały komunikacji, bezpośredni kontakt, bez czekania. Ważność 14 dni.',
            es:'Presupuestos vinculantes en 48 horas. Canales cortos, contactos directos, sin esperas. Validez 14 días.',
        },
        'services.s4.title':   { de:'Qualitätszertifikate', en:'Quality Certificates', fr:'Certificats de qualité', pl:'Certyfikaty jakości', es:'Certificados de calidad' },
        'services.s4.desc':    {
            de:'EN 10204 Werkszeugnisse (2.1, 3.1 oder 3.2) bei jeder Lieferung. Rückverfolgbarkeit garantiert. Alle Profile aus EN/DIN-zertifizierter Produktion.',
            en:'EN 10204 mill certificates (2.1, 3.1 or 3.2) with every delivery. Traceability guaranteed. All profiles from EN/DIN certified production.',
            fr:'Certificats d\'usine EN 10204 (2.1, 3.1 ou 3.2) avec chaque livraison. Traçabilité garantie. Tous les profilés de production certifiée EN/DIN.',
            pl:'Świadectwa zakładowe EN 10204 (2.1, 3.1 lub 3.2) przy każdej dostawie. Gwarantowana identyfikowalność. Wszystkie profile z produkcji certyfikowanej EN/DIN.',
            es:'Certificados de fábrica EN 10204 (2.1, 3.1 o 3.2) con cada entrega. Trazabilidad garantizada. Todos los perfiles de producción certificada EN/DIN.',
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
            de:'Nur Aluminium-Strangpressung — Individuelle Profile von zertifizierten Werken (max. ⌀ 350 mm)',
            en:'Aluminum Extrusion Only — Custom profiles from certified mills (max. ⌀ 350 mm)',
            fr:'Extrusion aluminium uniquement — Profilés sur mesure d\'usines certifiées (max. ⌀ 350 mm)',
            pl:'Tylko wytłaczanie aluminium — Profile niestandardowe z certyfikowanych zakładów (maks. ⌀ 350 mm)',
            es:'Solo extrusión de aluminio — Perfiles personalizados de fábricas certificadas (máx. ⌀ 350 mm)',
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
        'about.title':         { de:'Ihr Partner für\nMetallprofile', en:'Your Partner for\nMetal Profiles', fr:'Votre partenaire pour\nles profilés métalliques', pl:'Twój partner dla\nprofili metalowych', es:'Su socio para\nperfiles metálicos' },

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
        'footer.solutions':    { de:'Lösungen', en:'Solutions', fr:'Solutions', pl:'Rozwiązania', es:'Soluciones' },
        'footer.stdprofiles':  { de:'Standardprofile', en:'Standard Profiles', fr:'Profilés standard', pl:'Profile standardowe', es:'Perfiles estándar' },
        'footer.custom':       { de:'Strangpressung', en:'Custom Extrusion', fr:'Extrusion sur mesure', pl:'Wytłaczanie', es:'Extrusión' },
        'footer.sourcing':     { de:'Beschaffung', en:'Sourcing', fr:'Approvisionnement', pl:'Zaopatrzenie', es:'Suministro' },
        'footer.upload':       { de:'Zeichnung hochladen', en:'Upload Drawing', fr:'Télécharger dessin', pl:'Prześlij rysunek', es:'Subir dibujo' },
        'footer.profiles':     { de:'Profile', en:'Profiles', fr:'Profilés', pl:'Profile', es:'Perfiles' },
        'footer.beams':        { de:'I-Träger (IPE/HEA)', en:'I-Beams (IPE/HEA)', fr:'Poutrelles (IPE/HEA)', pl:'Dwuteowniki (IPE/HEA)', es:'Vigas I (IPE/HEA)' },
        'footer.hollow':       { de:'Hohlprofile', en:'Hollow Sections', fr:'Sections creuses', pl:'Profile zamknięte', es:'Secciones huecas' },
        'footer.window':       { de:'Fensterprofile', en:'Window Profiles', fr:'Profilés fenêtres', pl:'Profile okienne', es:'Perfiles de ventana' },
        'footer.extrusion':    { de:'Sonderprofile', en:'Custom Extrusions', fr:'Profilés sur mesure', pl:'Profile specjalne', es:'Extrusiones especiales' },
        'footer.company':      { de:'Unternehmen', en:'Company', fr:'Entreprise', pl:'Firma', es:'Empresa' },
        'footer.about':        { de:'Über uns', en:'About Us', fr:'À propos', pl:'O nas', es:'Nosotros' },
        'footer.howit':        { de:'So funktioniert es', en:'How It Works', fr:'Comment ça marche', pl:'Jak to działa', es:'Cómo funciona' },
        'footer.contact':      { de:'Kontakt', en:'Contact', fr:'Contact', pl:'Kontakt', es:'Contacto' },
        'footer.privacy':      { de:'Datenschutz', en:'Privacy', fr:'Confidentialité', pl:'Prywatność', es:'Privacidad' },
        'footer.copy':         { de:'© 2026 FERRON Trading GmbH. Alle Rechte vorbehalten.', en:'© 2026 FERRON Trading GmbH. All rights reserved.', fr:'© 2026 FERRON Trading GmbH. Tous droits réservés.', pl:'© 2026 FERRON Trading GmbH. Wszelkie prawa zastrzeżone.', es:'© 2026 FERRON Trading GmbH. Todos los derechos reservados.' },

        // Configurator Extended
        'config.step1':        { de:'Profiltyp', en:'Profile Type', fr:'Type de profilé', pl:'Typ profilu', es:'Tipo de perfil' },
        'config.step2':        { de:'Abmessungen', en:'Dimensions', fr:'Dimensions', pl:'Wymiary', es:'Dimensiones' },
        'config.step3':        { de:'Material & Oberfläche', en:'Material & Finish', fr:'Matériau & Finition', pl:'Materiał i wykończenie', es:'Material y acabado' },
        'config.step4':        { de:'Angebot', en:'Quote', fr:'Devis', pl:'Oferta', es:'Presupuesto' },
        'config.panel1.title': { de:'Profiltyp auswählen', en:'Select Profile Type', fr:'Sélectionner le type', pl:'Wybierz typ profilu', es:'Seleccionar tipo' },
        'config.panel2.title': { de:'Abmessungen konfigurieren', en:'Configure Dimensions', fr:'Configurer les dimensions', pl:'Skonfiguruj wymiary', es:'Configurar dimensiones' },
        'config.panel3.title': { de:'Material & Oberflächenbehandlung', en:'Material & Surface Treatment', fr:'Matériau & Traitement de surface', pl:'Materiał i obróbka powierzchni', es:'Material y tratamiento' },
        'config.panel4.title': { de:'Bestelldetails & Kalkulation', en:'Order Details & Estimate', fr:'Détails & Estimation', pl:'Szczegóły i kalkulacja', es:'Detalles y estimación' },
        'config.preview':      { de:'Querschnitt-Vorschau', en:'Cross-Section Preview', fr:'Aperçu de la section', pl:'Podgląd przekroju', es:'Vista previa de sección' },
        'config.stdsize':      { de:'Standardgröße', en:'Standard Size', fr:'Taille standard', pl:'Rozmiar standardowy', es:'Tamaño estándar' },
        'config.oradjust':     { de:'oder manuell anpassen', en:'or adjust manually', fr:'ou ajuster manuellement', pl:'lub dostosuj ręcznie', es:'o ajustar manualmente' },
        'config.back':         { de:'Zurück', en:'Back', fr:'Retour', pl:'Wstecz', es:'Atrás' },
        'config.continue':     { de:'Weiter', en:'Continue', fr:'Continuer', pl:'Dalej', es:'Continuar' },
        'config.selected':     { de:'Ausgewähltes Profil', en:'Selected Profile', fr:'Profilé sélectionné', pl:'Wybrany profil', es:'Perfil seleccionado' },
        'config.matcat':       { de:'Werkstoffkategorie', en:'Material Category', fr:'Catégorie de matériau', pl:'Kategoria materiału', es:'Categoría de material' },
        'config.mat.steel':    { de:'Baustahl', en:'Structural Steel', fr:'Acier de construction', pl:'Stal konstrukcyjna', es:'Acero estructural' },
        'config.mat.stainless':{ de:'Edelstahl', en:'Stainless Steel', fr:'Acier inoxydable', pl:'Stal nierdzewna', es:'Acero inoxidable' },
        'config.mat.aluminum': { de:'Aluminium', en:'Aluminum', fr:'Aluminium', pl:'Aluminium', es:'Aluminio' },
        'config.grade':        { de:'Güte / Legierung', en:'Grade', fr:'Nuance', pl:'Gatunek', es:'Grado' },
        'config.surface':      { de:'Oberflächenbehandlung', en:'Surface Treatment', fr:'Traitement de surface', pl:'Obróbka powierzchni', es:'Tratamiento superficial' },
        'config.length':       { de:'Länge pro Stück', en:'Length per Piece', fr:'Longueur par pièce', pl:'Długość na sztukę', es:'Longitud por pieza' },
        'config.length.hint':  { de:'Standard: 6.000 / 12.000 mm. Min: 500 mm.', en:'Standard: 6,000 / 12,000 mm. Min: 500 mm.', fr:'Standard: 6 000 / 12 000 mm. Min: 500 mm.', pl:'Standard: 6 000 / 12 000 mm. Min: 500 mm.', es:'Estándar: 6.000 / 12.000 mm. Mín: 500 mm.' },
        'config.qty':          { de:'Menge (Stück)', en:'Quantity (pieces)', fr:'Quantité (pièces)', pl:'Ilość (sztuk)', es:'Cantidad (piezas)' },
        'config.pcs':          { de:'Stk.', en:'pcs', fr:'pcs', pl:'szt.', es:'uds' },
        'config.delivery':     { de:'Lieferung', en:'Delivery', fr:'Livraison', pl:'Dostawa', es:'Entrega' },
        'config.delivery.std': { de:'Standard (2-4 Wochen)', en:'Standard (2-4 weeks)', fr:'Standard (2-4 semaines)', pl:'Standard (2-4 tygodnie)', es:'Estándar (2-4 semanas)' },
        'config.delivery.exp': { de:'Express (5-10 Tage, +15%)', en:'Express (5-10 days, +15%)', fr:'Express (5-10 jours, +15%)', pl:'Ekspres (5-10 dni, +15%)', es:'Exprés (5-10 días, +15%)' },
        'config.disclaimer':   { de:'Dies ist eine unverbindliche Schätzung auf Basis aktueller Marktpreise. Der endgültige Preis hängt von Verfügbarkeit, genauen Spezifikationen und Bestellmenge ab. Fordern Sie ein formelles Angebot an — gültig für 14 Tage.', en:'This is a non-binding estimate based on current market prices. Final pricing depends on availability, exact specifications, and order volume. Request a formal quote to receive a binding offer valid for 14 days.', fr:'Ceci est une estimation non contraignante. Le prix final dépend de la disponibilité et des spécifications exactes. Demandez un devis formel valable 14 jours.', pl:'To jest niewiążące oszacowanie oparte na aktualnych cenach rynkowych. Ostateczna cena zależy od dostępności i specyfikacji. Poproś o formalną ofertę ważną 14 dni.', es:'Esta es una estimación no vinculante. El precio final depende de la disponibilidad y especificaciones exactas. Solicite un presupuesto formal válido por 14 días.' },
        'config.request':      { de:'Verbindliches Angebot anfragen', en:'Request Formal Quote', fr:'Demander un devis formel', pl:'Poproś o ofertę', es:'Solicitar presupuesto formal' },
        'config.restart':      { de:'Neue Konfiguration starten', en:'Start New Configuration', fr:'Nouvelle configuration', pl:'Nowa konfiguracja', es:'Nueva configuración' },

        // Process Extended
        'process.desc':        { de:'Von der Anfrage bis zur Lieferung — wir kümmern uns um alles.', en:'From inquiry to delivery — we take care of everything.', fr:'De la demande à la livraison — nous nous occupons de tout.', pl:'Od zapytania do dostawy — zajmujemy się wszystkim.', es:'Desde la consulta hasta la entrega — nos encargamos de todo.' },
        'process.s1.desc':     { de:'Nutzen Sie unseren Konfigurator oder senden Sie uns Ihre Zeichnung. Wir klären technische Fragen und prüfen die Machbarkeit.', en:'Use our configurator or send us your drawing. We clarify technical questions and check feasibility.', fr:'Utilisez notre configurateur ou envoyez-nous votre dessin. Nous clarifions les questions techniques.', pl:'Użyj naszego konfiguratora lub wyślij nam rysunek. Wyjaśniamy kwestie techniczne.', es:'Use nuestro configurador o envíenos su dibujo. Aclaramos cuestiones técnicas.' },
        'process.s2.desc':     { de:'Innerhalb von 48 Stunden erhalten Sie ein verbindliches Angebot. Transparente Preise, keine versteckten Kosten. 14 Tage gültig.', en:'Within 48 hours you receive a binding quote. Transparent prices, no hidden costs. Valid for 14 days.', fr:'Sous 48 heures vous recevez un devis contraignant. Prix transparents, pas de coûts cachés. Valable 14 jours.', pl:'W ciągu 48 godzin otrzymujesz wiążącą ofertę. Przejrzyste ceny, bez ukrytych kosztów. Ważna 14 dni.', es:'En 48 horas recibe un presupuesto vinculante. Precios transparentes, sin costos ocultos. Válido 14 días.' },
        'process.s3.desc':     { de:'Wir beauftragen die Fertigung bei unseren zertifizierten Produktionspartnern. Qualitätskontrolle und EN 10204 Zeugnisse inklusive.', en:'We commission production at our certified manufacturing partners. Quality control and EN 10204 certificates included.', fr:'Nous commandons la production auprès de nos partenaires certifiés. Contrôle qualité et certificats EN 10204 inclus.', pl:'Zlecamy produkcję u naszych certyfikowanych partnerów. Kontrola jakości i świadectwa EN 10204 w cenie.', es:'Encargamos la producción a nuestros socios certificados. Control de calidad y certificados EN 10204 incluidos.' },
        'process.s4.desc':     { de:'Lieferung frei Haus oder ab Werk europaweit. Persönlicher Ansprechpartner für Ihren Auftrag. Abrufaufträge möglich.', en:'Delivery to your site or ex-works across Europe. Personal contact for your order. Call-off orders available.', fr:'Livraison sur site ou départ usine dans toute l\'Europe. Contact personnel pour votre commande.', pl:'Dostawa na miejsce lub loco zakład w całej Europie. Osobisty kontakt dla Twojego zamówienia.', es:'Entrega en sitio o en fábrica en toda Europa. Contacto personal para su pedido.' },

        // About Extended
        'about.text1':         { de:'FERRON ist Ihr spezialisierter Beschaffungspartner für Aluminium-Strangpressprofile und Stahlprofile. Wir arbeiten direkt mit zertifizierten europäischen Produzenten zusammen und bieten Ihnen kurze Wege, schnelle Angebote und garantierte Qualität.', en:'FERRON is your specialized sourcing partner for aluminum extrusion profiles and steel profiles. We work directly with certified European producers and offer you short paths, fast quotes and guaranteed quality.', fr:'FERRON est votre partenaire d\'approvisionnement spécialisé pour les profilés d\'extrusion aluminium et les profilés acier. Nous travaillons directement avec des producteurs européens certifiés.', pl:'FERRON to Twój wyspecjalizowany partner zaopatrzeniowy w zakresie profili aluminiowych i stalowych. Współpracujemy bezpośrednio z certyfikowanymi europejskimi producentami.', es:'FERRON es su socio especializado en suministro de perfiles de extrusión de aluminio y perfiles de acero. Trabajamos directamente con productores europeos certificados.' },
        'about.text2':         { de:'Ob Standard-Baustahl, Hohlprofile oder kundenspezifische Aluminium-Strangpressprofile — wir kennen die Werke, die Prozesse und die Anforderungen. Sie erhalten technische Beratung, wettbewerbsfähige Preise und EN 10204 Zeugnisse bei jeder Lieferung.', en:'Whether standard structural steel, hollow sections or custom aluminum extrusions — we know the mills, the processes and the requirements. You get technical advice, competitive prices and EN 10204 certificates with every delivery.', fr:'Qu\'il s\'agisse d\'acier de construction standard, de sections creuses ou de profilés aluminium sur mesure — nous connaissons les usines, les processus et les exigences. Certificats EN 10204 avec chaque livraison.', pl:'Czy to standardowa stal konstrukcyjna, profile zamknięte czy niestandardowe profile aluminiowe — znamy zakłady, procesy i wymagania. Otrzymujesz świadectwa EN 10204 przy każdej dostawie.', es:'Ya sea acero estructural estándar, secciones huecas o extrusiones de aluminio personalizadas — conocemos las plantas, los procesos y los requisitos. Certificados EN 10204 con cada entrega.' },
        'about.val1.title':    { de:'Zertifizierte Werke', en:'Certified Mills', fr:'Usines certifiées', pl:'Certyfikowane zakłady', es:'Fábricas certificadas' },
        'about.val1.desc':     { de:'Nur geprüfte europäische Produzenten', en:'Only verified European producers', fr:'Uniquement des producteurs européens vérifiés', pl:'Tylko zweryfikowani europejscy producenci', es:'Solo productores europeos verificados' },
        'about.val2.title':    { de:'Schnelle Reaktion', en:'Fast Response', fr:'Réponse rapide', pl:'Szybka odpowiedź', es:'Respuesta rápida' },
        'about.val2.desc':     { de:'Angebote innerhalb 48 Stunden', en:'Quotes within 48 hours', fr:'Devis sous 48 heures', pl:'Oferty w ciągu 48 godzin', es:'Presupuestos en 48 horas' },
        'about.val3.title':    { de:'Volle Dokumentation', en:'Full Documentation', fr:'Documentation complète', pl:'Pełna dokumentacja', es:'Documentación completa' },
        'about.val3.desc':     { de:'EN 10204 Zeugnisse inklusive', en:'EN 10204 certificates included', fr:'Certificats EN 10204 inclus', pl:'Świadectwa EN 10204 w cenie', es:'Certificados EN 10204 incluidos' },

        // Contact Extended
        'contact.direct':      { de:'Direktkontakt', en:'Direct Contact', fr:'Contact direct', pl:'Kontakt bezpośredni', es:'Contacto directo' },
        'contact.email.label': { de:'E-Mail', en:'Email', fr:'E-mail', pl:'E-mail', es:'Correo' },
        'contact.phone.label': { de:'Telefon', en:'Phone', fr:'Téléphone', pl:'Telefon', es:'Teléfono' },
        'contact.office.label':{ de:'Büro', en:'Office', fr:'Bureau', pl:'Biuro', es:'Oficina' },
        'contact.legal.label': { de:'Handelsregister', en:'Company Registration', fr:'Registre du commerce', pl:'Rejestr handlowy', es:'Registro mercantil' },
        'contact.hours':       { de:'Geschäftszeiten', en:'Business Hours', fr:'Heures d\'ouverture', pl:'Godziny pracy', es:'Horario comercial' },
        'contact.hours.note':  { de:'E-Mail-Anfragen werden in der Regel innerhalb eines Werktages beantwortet.', en:'Email inquiries are typically answered within one business day.', fr:'Les demandes par e-mail sont généralement traitées sous un jour ouvrable.', pl:'Zapytania e-mailowe są zwykle odpowiadane w ciągu jednego dnia roboczego.', es:'Las consultas por correo electrónico se responden normalmente en un día hábil.' },
        'contact.upload':      { de:'Technische Zeichnung hochladen (optional)', en:'Upload Technical Drawing (optional)', fr:'Télécharger dessin technique (optionnel)', pl:'Prześlij rysunek techniczny (opcjonalnie)', es:'Subir dibujo técnico (opcional)' },
        'contact.upload.hint': { de:'PDF, DWG, DXF, STEP oder Bild. Max. 10 MB.', en:'PDF, DWG, DXF, STEP, or image. Max 10 MB.', fr:'PDF, DWG, DXF, STEP ou image. Max 10 Mo.', pl:'PDF, DWG, DXF, STEP lub obraz. Maks. 10 MB.', es:'PDF, DWG, DXF, STEP o imagen. Máx. 10 MB.' },

        // Modal
        'modal.title':         { de:'Angebotsanfrage gesendet', en:'Quote Request Sent', fr:'Demande de devis envoyée', pl:'Zapytanie wysłane', es:'Solicitud enviada' },
        'modal.text':          { de:'Ihre Konfiguration wurde an unser Team gesendet. Wir prüfen Ihre Spezifikationen und senden Ihnen innerhalb von 48 Stunden ein detailliertes, verbindliches Angebot per E-Mail.', en:'Your configuration has been sent to our team. We will review your specifications and send you a detailed, binding quote by email within 48 hours.', fr:'Votre configuration a été envoyée. Nous vous enverrons un devis détaillé sous 48 heures.', pl:'Twoja konfiguracja została wysłana. Wyślemy szczegółową ofertę w ciągu 48 godzin.', es:'Su configuración ha sido enviada. Le enviaremos un presupuesto detallado en 48 horas.' },
        'modal.ref':           { de:'Referenz:', en:'Reference:', fr:'Référence:', pl:'Numer referencyjny:', es:'Referencia:' },
        'modal.ok':            { de:'Fertig', en:'Done', fr:'Terminé', pl:'Gotowe', es:'Hecho' },

        // Custom Configurator
        'cc.props':            { de:'Profileigenschaften', en:'Profile Properties', fr:'Propriétés du profilé', pl:'Właściwości profilu', es:'Propiedades del perfil' },
        'cc.draw.hint':        { de:'Zeichnen Sie ein Außenprofil, um Berechnungen zu sehen', en:'Draw an outer profile to see calculations', fr:'Dessinez un contour pour voir les calculs', pl:'Narysuj zewnętrzny profil, aby zobaczyć obliczenia', es:'Dibuje un perfil para ver los cálculos' },
        'cc.material':         { de:'Werkstoff', en:'Material', fr:'Matériau', pl:'Materiał', es:'Material' },
        'cc.alloy':            { de:'Legierung', en:'Alloy', fr:'Alliage', pl:'Stop', es:'Aleación' },
        'cc.surface':          { de:'Oberflächenbehandlung', en:'Surface Treatment', fr:'Traitement de surface', pl:'Obróbka powierzchni', es:'Tratamiento superficial' },
        'cc.finish.raw':       { de:'Walzblank', en:'Mill Finish', fr:'Brut de laminage', pl:'Surowy', es:'Acabado de fábrica' },
        'cc.finish.anod':      { de:'Eloxiert Natur (E6/EV1)', en:'Anodized Natural (E6/EV1)', fr:'Anodisé naturel (E6/EV1)', pl:'Anodowane naturalne (E6/EV1)', es:'Anodizado natural (E6/EV1)' },
        'cc.finish.anodc':     { de:'Eloxiert farbig', en:'Anodized Coloured', fr:'Anodisé couleur', pl:'Anodowane kolorowe', es:'Anodizado color' },
        'cc.finish.powder':    { de:'Pulverbeschichtet (RAL)', en:'Powder Coated (RAL)', fr:'Thermolaqué (RAL)', pl:'Malowane proszkowo (RAL)', es:'Lacado en polvo (RAL)' },
        'cc.finish.hard':      { de:'Harteloxiert', en:'Hard Anodized (Hardcoat)', fr:'Anodisation dure', pl:'Twarde anodowanie', es:'Anodizado duro' },
        'cc.order':            { de:'Bestelldetails', en:'Order Details', fr:'Détails de commande', pl:'Szczegóły zamówienia', es:'Detalles del pedido' },
        'cc.length':           { de:'Länge pro Stück', en:'Length per Piece', fr:'Longueur par pièce', pl:'Długość na sztukę', es:'Longitud por pieza' },
        'cc.qty':              { de:'Menge', en:'Quantity', fr:'Quantité', pl:'Ilość', es:'Cantidad' },
        'cc.pcs':              { de:'Stk.', en:'pcs', fr:'pcs', pl:'szt.', es:'uds' },
        'cc.delivery':         { de:'Lieferung', en:'Delivery', fr:'Livraison', pl:'Dostawa', es:'Entrega' },
        'cc.del.std':          { de:'Standard (4-8 Wochen inkl. Werkzeug)', en:'Standard (4-8 weeks incl. die)', fr:'Standard (4-8 semaines incl. outillage)', pl:'Standard (4-8 tygodni z narzędziem)', es:'Estándar (4-8 semanas incl. matriz)' },
        'cc.del.exp':          { de:'Express (3-5 Wochen, +15%)', en:'Express (3-5 weeks, +15%)', fr:'Express (3-5 semaines, +15%)', pl:'Ekspres (3-5 tygodni, +15%)', es:'Exprés (3-5 semanas, +15%)' },
        'cc.estimate':         { de:'Preiskalkulation', en:'Price Estimate', fr:'Estimation de prix', pl:'Szacunkowa cena', es:'Estimación de precio' },
        'cc.request':          { de:'Verbindliches Angebot anfragen', en:'Request Formal Quote', fr:'Demander un devis formel', pl:'Poproś o ofertę', es:'Solicitar presupuesto formal' },
        'cc.upload.hint':      { de:'Haben Sie eine technische Zeichnung? <a href="#contact">Laden Sie sie über unser Kontaktformular hoch</a> für ein präzises Angebot.', en:'Have a technical drawing? <a href="#contact">Upload it via our contact form</a> for a precise quote.', fr:'Vous avez un dessin technique? <a href="#contact">Téléchargez-le via notre formulaire</a> pour un devis précis.', pl:'Masz rysunek techniczny? <a href="#contact">Prześlij go przez formularz kontaktowy</a> dla dokładnej wyceny.', es:'¿Tiene un dibujo técnico? <a href="#contact">Súbalo a través de nuestro formulario</a> para un presupuesto preciso.' },
        'cc.disclaimer':       { de:'Unverbindliche Schätzung. Werkzeugkosten sind einmalige Investition, amortisiert über die Erstbestellung. Folgebestellungen nur Materialkosten. Max. umschreibender Kreis: 300 mm.', en:'Non-binding estimate. Die cost is one-time tooling investment amortized across the initial order. Repeat orders only incur material cost. Max circumscribing circle: 300 mm.', fr:'Estimation non contraignante. Le coût de l\'outillage est amorti sur la première commande. Commandes suivantes: coût matière uniquement. Cercle circonscrit max: 300 mm.', pl:'Niewiążące oszacowanie. Koszt narzędzia amortyzowany w pierwszym zamówieniu. Kolejne zamówienia tylko koszt materiału. Maks. koło opisujące: 300 mm.', es:'Estimación no vinculante. El costo de la matriz se amortiza en el primer pedido. Pedidos siguientes solo costo de material. Círculo circunscrito máx: 300 mm.' },

        // Specifications Section
        'specs.tag':           { de:'Technische Daten', en:'Technical Data', fr:'Données techniques', pl:'Dane techniczne', es:'Datos técnicos' },
        'specs.title':         { de:'Qualität & Toleranzen', en:'Quality & Tolerances', fr:'Qualité & Tolérances', pl:'Jakość i tolerancje', es:'Calidad y tolerancias' },
        'specs.desc':          { de:'Alle Profile entsprechen EN/DIN-Normen. Hier die wichtigsten technischen Parameter auf einen Blick.', en:'All profiles comply with EN/DIN standards. Key technical parameters at a glance.', fr:'Tous les profilés sont conformes aux normes EN/DIN. Paramètres techniques clés en un coup d\'œil.', pl:'Wszystkie profile zgodne z normami EN/DIN. Kluczowe parametry techniczne w skrócie.', es:'Todos los perfiles cumplen con las normas EN/DIN. Parámetros técnicos clave de un vistazo.' },
        'specs.press.title':   { de:'Strangpresse', en:'Extrusion Press', fr:'Presse d\'extrusion', pl:'Prasa do wytłaczania', es:'Prensa de extrusión' },
        'specs.press.force':   { de:'Presskraft:', en:'Press Force:', fr:'Force de presse:', pl:'Siła prasy:', es:'Fuerza de prensa:' },
        'specs.press.circle':  { de:'Max. Hüllkreis:', en:'Max. Circumscribing Circle:', fr:'Cercle circonscrit max:', pl:'Maks. koło opisujące:', es:'Círculo circunscrito máx:' },
        'specs.press.wall':    { de:'Min. Wandstärke:', en:'Min. Wall Thickness:', fr:'Épaisseur min:', pl:'Min. grubość ścianki:', es:'Espesor mín:' },
        'specs.press.length':  { de:'Profillängen:', en:'Profile Lengths:', fr:'Longueurs de profilé:', pl:'Długości profilu:', es:'Longitudes de perfil:' },
        'specs.press.weight':  { de:'Max. Metergewicht:', en:'Max. Weight per Meter:', fr:'Poids max par mètre:', pl:'Maks. waga na metr:', es:'Peso máx por metro:' },
        'specs.tol.title':     { de:'Toleranzen Aluminium', en:'Aluminum Tolerances', fr:'Tolérances aluminium', pl:'Tolerancje aluminium', es:'Tolerancias aluminio' },
        'specs.tol.dim':       { de:'Maße (Querschnitt):', en:'Dimensions (Cross-section):', fr:'Dimensions (section):', pl:'Wymiary (przekrój):', es:'Dimensiones (sección):' },
        'specs.tol.straight':  { de:'Geradheit:', en:'Straightness:', fr:'Rectitude:', pl:'Prostoliniowość:', es:'Rectitud:' },
        'specs.tol.twist':     { de:'Verwindung:', en:'Twist:', fr:'Torsion:', pl:'Skręcenie:', es:'Torsión:' },
        'specs.tol.length':    { de:'Länge:', en:'Length:', fr:'Longueur:', pl:'Długość:', es:'Longitud:' },
        'specs.tol.angle':     { de:'Winkel:', en:'Angle:', fr:'Angle:', pl:'Kąt:', es:'Ángulo:' },
        'specs.steel.title':   { de:'Stahlprofile', en:'Steel Profiles', fr:'Profilés acier', pl:'Profile stalowe', es:'Perfiles de acero' },
        'specs.steel.norm':    { de:'Normen:', en:'Standards:', fr:'Normes:', pl:'Normy:', es:'Normas:' },
        'specs.steel.grades':  { de:'Güten:', en:'Grades:', fr:'Nuances:', pl:'Gatunki:', es:'Grados:' },
        'specs.steel.cert':    { de:'Zeugnisse:', en:'Certificates:', fr:'Certificats:', pl:'Świadectwa:', es:'Certificados:' },
        'specs.steel.lengths': { de:'Längen:', en:'Lengths:', fr:'Longueurs:', pl:'Długości:', es:'Longitudes:' },
        'specs.steel.tol':     { de:'Toleranzen:', en:'Tolerances:', fr:'Tolérances:', pl:'Tolerancje:', es:'Tolerancias:' },
        'specs.order.title':   { de:'Bestellhinweise', en:'Order Information', fr:'Informations de commande', pl:'Informacje o zamówieniu', es:'Información de pedido' },
        'specs.order.min':     { de:'Mindestmenge Stahl:', en:'Min. Order Steel:', fr:'Quantité min. acier:', pl:'Min. zamówienie stal:', es:'Pedido mín. acero:' },
        'specs.order.minal':   { de:'Mindestmenge Aluminium:', en:'Min. Order Aluminum:', fr:'Quantité min. aluminium:', pl:'Min. zamówienie aluminium:', es:'Pedido mín. aluminio:' },
        'specs.order.lead':    { de:'Lieferzeit Stahl:', en:'Lead Time Steel:', fr:'Délai acier:', pl:'Czas dostawy stal:', es:'Plazo acero:' },
        'specs.order.leadal':  { de:'Lieferzeit Alu (mit Werkzeug):', en:'Lead Time Aluminum (with die):', fr:'Délai aluminium (avec outillage):', pl:'Czas dostawy alu (z narzędziem):', es:'Plazo aluminio (con matriz):' },
        'specs.order.quote':   { de:'Angebotsvalidität:', en:'Quote Validity:', fr:'Validité du devis:', pl:'Ważność oferty:', es:'Validez del presupuesto:' },

        // Privacy Section
        'privacy.title':       { de:'Datenschutzerklärung', en:'Privacy Policy', fr:'Politique de confidentialité', pl:'Polityka prywatności', es:'Política de privacidad' },

        // Trust Section
        'trust.label':         { de:'Warum FERRON?', en:'Why FERRON?', fr:'Pourquoi FERRON?', pl:'Dlaczego FERRON?', es:'¿Por qué FERRON?' },
        'trust.quote':         { de:'Angebote', en:'Quotes', fr:'Devis', pl:'Oferty', es:'Presupuestos' },
        'trust.certified':     { de:'Zertifizierte Werke', en:'Certified Mills', fr:'Usines certifiées', pl:'Certyfikowane zakłady', es:'Fábricas certificadas' },
        'trust.contact':       { de:'Ansprechpartner', en:'Contact Person', fr:'Interlocuteur', pl:'Osoba kontaktowa', es:'Persona de contacto' },
        'trust.trace':         { de:'Rückverfolgbar', en:'Traceable', fr:'Traçable', pl:'Identyfikowalny', es:'Trazable' },
        'trust.industries':    { de:'Profile für:', en:'Profiles for:', fr:'Profilés pour:', pl:'Profile dla:', es:'Perfiles para:' },
        'trust.ind1':          { de:'Fensterbau', en:'Window Construction', fr:'Construction de fenêtres', pl:'Budowa okien', es:'Construcción de ventanas' },
        'trust.ind2':          { de:'Möbelindustrie', en:'Furniture Industry', fr:'Industrie du meuble', pl:'Przemysł meblarski', es:'Industria del mueble' },
        'trust.ind3':          { de:'Ladenbau', en:'Shop Fitting', fr:'Agencement de magasins', pl:'Wyposażenie sklepów', es:'Equipamiento de tiendas' },
        'trust.ind4':          { de:'Fahrzeugbau', en:'Vehicle Construction', fr:'Construction de véhicules', pl:'Budowa pojazdów', es:'Construcción de vehículos' },
        'trust.ind5':          { de:'Maschinenbau', en:'Mechanical Engineering', fr:'Construction mécanique', pl:'Budowa maszyn', es:'Ingeniería mecánica' },
        'trust.ind6':          { de:'Fassadenbau', en:'Facade Systems', fr:'Systèmes de façades', pl:'Systemy fasadowe', es:'Sistemas de fachadas' },
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
