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
        'hero.badge':         { de:'Profilhersteller seit 1968 — Made in Germany', en:'Profile Manufacturer since 1968 — Made in Germany', fr:'Fabricant de profilés depuis 1968 — Made in Germany', pl:'Producent profili od 1968 — Made in Germany', es:'Fabricante de perfiles desde 1968 — Made in Germany' },
        'hero.title1':        { de:'Aluminium- & Stahlprofile', en:'Aluminum & Steel Profiles', fr:'Profilés aluminium & acier', pl:'Profile aluminiowe i stalowe', es:'Perfiles de aluminio y acero' },
        'hero.title2':        { de:'aus eigener Fertigung.', en:'from our own production.', fr:'de notre propre fabrication.', pl:'z własnej produkcji.', es:'de nuestra propia producción.' },
        'hero.subtitle':      {
            de:'Mit über 55 Jahren Erfahrung fertigen wir auf unseren Strangpressen individuelle Aluminiumprofile von 120 g/m bis 3.400 g/m. Dazu kaltgewalzte Stahlprofile für Fenster-, Möbel- und Fahrzeugbau. 40.000 Tonnen Jahreskapazität. EN 10204 Zeugnisse inklusive.',
            en:'With over 55 years of experience, we manufacture custom aluminum profiles from 120 g/m to 3,400 g/m on our extrusion presses. Plus cold-rolled steel profiles for window, furniture, and vehicle construction. 40,000 tons annual capacity. EN 10204 certificates included.',
            fr:'Avec plus de 55 ans d\'expérience, nous fabriquons des profilés aluminium sur mesure de 120 g/m à 3.400 g/m. Plus des profilés acier laminés à froid. Capacité annuelle de 40.000 tonnes. Certificats EN 10204 inclus.',
            pl:'Z ponad 55-letnim doświadczeniem produkujemy niestandardowe profile aluminiowe od 120 g/m do 3.400 g/m. Plus profile stalowe walcowane na zimno. 40.000 ton rocznej wydajności. Świadectwa EN 10204 w cenie.',
            es:'Con más de 55 años de experiencia, fabricamos perfiles de aluminio a medida de 120 g/m a 3.400 g/m. Además, perfiles de acero laminados en frío. 40.000 toneladas de capacidad anual. Certificados EN 10204 incluidos.',
        },
        'hero.cta.configure':   { de:'Profil konfigurieren', en:'Configure Profile', fr:'Configurer un profilé', pl:'Konfiguruj profil', es:'Configurar perfil' },
        'hero.cta.contact':     { de:'Anfrage senden', en:'Send Inquiry', fr:'Envoyer une demande', pl:'Wyślij zapytanie', es:'Enviar consulta' },
        'hero.stat.capacity':   { de:'t/Jahr Kapazität', en:'t/year capacity', fr:'t/an capacité', pl:'t/rok wydajności', es:'t/año capacidad' },
        'hero.stat.experience': { de:'Jahre Erfahrung', en:'Years Experience', fr:'Années d\'expérience', pl:'Lat doświadczenia', es:'Años de experiencia' },
        'hero.stat.maxweight':  { de:'g/m max. Gewicht', en:'g/m max weight', fr:'g/m poids max', pl:'g/m maks. waga', es:'g/m peso máx' },

        // Services
        'services.tag':        { de:'Unsere Fertigung', en:'Our Production', fr:'Notre production', pl:'Nasza produkcja', es:'Nuestra producción' },
        'services.title':      { de:'Vom Entwurf zum\nfertigen Profil', en:'From Design to\nFinished Profile', fr:'Du design au\nprofilé fini', pl:'Od projektu do\ngotowego profilu', es:'Del diseño al\nperfil terminado' },
        'services.desc':       {
            de:'In unserer Produktion fertigen wir Strangpress- und Walzprofile nach Ihren Vorgaben. Von der Werkzeugkonstruktion bis zur Oberflächenveredelung — alles aus einer Hand.',
            en:'In our production facilities, we manufacture extrusion and rolled profiles to your specifications. From die design to surface finishing — everything under one roof.',
            fr:'Dans notre production, nous fabriquons des profilés extrudés et laminés selon vos spécifications. De la conception d\'outillage à la finition de surface — tout en interne.',
            pl:'W naszej produkcji wytwarzamy profile wytłaczane i walcowane według Twoich specyfikacji. Od projektu narzędzi po wykończenie powierzchni — wszystko w jednym miejscu.',
            es:'En nuestra producción fabricamos perfiles extruidos y laminados según sus especificaciones. Desde el diseño de matrices hasta el acabado superficial — todo bajo un mismo techo.',
        },
        'services.s1.title':   { de:'Aluminium-Strangpressung', en:'Aluminum Extrusion', fr:'Extrusion aluminium', pl:'Wytłaczanie aluminium', es:'Extrusión de aluminio' },
        'services.s1.desc':    {
            de:'Auf unseren Strangpressen fertigen wir Profile von 120 g/m bis 3.400 g/m in allen gängigen Legierungen (6060, 6063, 6082). 40.000 Tonnen Jahreskapazität für Serien- und Sonderprofile.',
            en:'On our extrusion presses, we manufacture profiles from 120 g/m to 3,400 g/m in all common alloys (6060, 6063, 6082). 40,000 tons annual capacity for standard and custom profiles.',
            fr:'Sur nos presses, nous fabriquons des profilés de 120 g/m à 3.400 g/m dans tous les alliages courants. 40.000 tonnes de capacité annuelle.',
            pl:'Na naszych prasach produkujemy profile od 120 g/m do 3.400 g/m we wszystkich popularnych stopach. 40.000 ton rocznej wydajności.',
            es:'En nuestras prensas fabricamos perfiles de 120 g/m a 3.400 g/m en todas las aleaciones comunes. 40.000 toneladas de capacidad anual.',
        },
        'services.s2.title':   { de:'Stahl-Kaltwalzprofile', en:'Cold-Rolled Steel Profiles', fr:'Profilés acier laminés à froid', pl:'Profile stalowe walcowane na zimno', es:'Perfiles de acero laminados en frío' },
        'services.s2.desc':    {
            de:'In unserer Walzanlage produzieren wir kaltgewalzte Stahlprofile für die Fenster- und Türenindustrie. 30.000 Tonnen Jahreskapazität mit Präzisionstoleranzen nach EN 10162.',
            en:'In our rolling mill, we produce cold-rolled steel profiles for the window and door industry. 30,000 tons annual capacity with precision tolerances according to EN 10162.',
            fr:'Dans notre laminoir, nous produisons des profilés acier pour l\'industrie des fenêtres et portes. 30.000 tonnes de capacité avec tolérances EN 10162.',
            pl:'W naszej walcowni produkujemy profile stalowe walcowane na zimno dla branży okiennej. 30.000 ton rocznej wydajności z tolerancjami EN 10162.',
            es:'En nuestro laminador producimos perfiles de acero para la industria de ventanas y puertas. 30.000 toneladas de capacidad con tolerancias EN 10162.',
        },
        'services.s3.title':   { de:'Werkzeugbau', en:'Tool & Die Making', fr:'Fabrication d\'outillage', pl:'Budowa narzędzi', es:'Fabricación de matrices' },
        'services.s3.desc':    {
            de:'Eigene Werkzeugfertigung für Strangpress-Matrizen. Von der CAD-Konstruktion bis zur CNC-Bearbeitung — Neuwerkzeuge in 2-3 Wochen, Reparaturen in 5 Tagen.',
            en:'In-house die manufacturing for extrusion tools. From CAD design to CNC machining — new dies in 2-3 weeks, repairs in 5 days.',
            fr:'Fabrication d\'outillage en interne pour les matrices d\'extrusion. De la CAO à l\'usinage CNC — nouvelles matrices en 2-3 semaines, réparations en 5 jours.',
            pl:'Własna produkcja narzędzi do matryc. Od CAD do obróbki CNC — nowe narzędzia w 2-3 tygodnie, naprawy w 5 dni.',
            es:'Fabricación propia de matrices de extrusión. Desde CAD hasta mecanizado CNC — matrices nuevas en 2-3 semanas, reparaciones en 5 días.',
        },
        'services.s4.title':   { de:'Oberflächenveredelung', en:'Surface Finishing', fr:'Finition de surface', pl:'Wykończenie powierzchni', es:'Acabado superficial' },
        'services.s4.desc':    {
            de:'Eloxieren, Pulverbeschichten, Folieren — alle gängigen Oberflächenbehandlungen in unserer eigenen Anlage oder über zertifizierte Partner. Bis 7.500 mm Profillänge eloxierbar.',
            en:'Anodizing, powder coating, foiling — all common surface treatments in our own facility or through certified partners. Anodizing up to 7,500 mm profile length.',
            fr:'Anodisation, thermolaquage, pelliculage — tous les traitements dans nos installations ou via partenaires certifiés. Anodisation jusqu\'à 7.500 mm.',
            pl:'Anodowanie, malowanie proszkowe, foliowanie — wszystkie popularne obróbki we własnych zakładach lub przez partnerów. Anodowanie do 7.500 mm.',
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
        'process.desc':        { de:'Von der Spezifikation bis zur Lieferung in vier einfachen Schritten. Keine versteckten Kosten, keine Komplexität.', en:'From specification to delivery in four straightforward steps. No hidden fees, no complexity.', fr:'De la spécification à la livraison en quatre étapes simples. Pas de frais cachés.', pl:'Od specyfikacji do dostawy w czterech prostych krokach. Bez ukrytych kosztów.', es:'De la especificación a la entrega en cuatro sencillos pasos. Sin costos ocultos.' },
        'process.s1.desc':     { de:'Nutzen Sie unseren Konfigurator oder senden Sie uns Ihre Spezifikationen. Definieren Sie Profile, Abmessungen, Werkstoffe und Mengen. Zeichnen Sie individuelle Querschnitte oder wählen Sie Standardprofile.', en:'Use our configurator or send us your specifications. Define profiles, dimensions, materials, and quantities. Draw custom cross-sections or choose from standard profiles.', fr:'Utilisez notre configurateur ou envoyez-nous vos spécifications. Définissez profils, dimensions, matériaux et quantités.', pl:'Użyj naszego konfiguratora lub wyślij nam specyfikacje. Zdefiniuj profile, wymiary, materiały i ilości.', es:'Use nuestro configurador o envíenos sus especificaciones. Defina perfiles, dimensiones, materiales y cantidades.' },
        'process.s2.desc':     { de:'Erhalten Sie innerhalb von 48 Stunden ein detailliertes, verbindliches Angebot. Transparente Preise ohne versteckte Aufschläge. Sonderprofile inkl. Werkzeugkosten-Aufschlüsselung.', en:'Receive a detailed, binding quote within 48 hours. Transparent pricing with no hidden surcharges. Custom profiles include die cost breakdown.', fr:'Recevez un devis détaillé et contraignant sous 48 heures. Tarification transparente sans surcharge.', pl:'Otrzymaj szczegółową, wiążącą ofertę w ciągu 48 godzin. Przejrzyste ceny bez ukrytych dopłat.', es:'Reciba un presupuesto detallado y vinculante en 48 horas. Precios transparentes sin recargos ocultos.' },
        'process.s3.desc':     { de:'Aluminium-Sonderprofile werden auf einer der modernsten mittelgroßen Pressen Europas stranggepresst. Stahlprofile stammen aus zertifizierten Walzwerken. EN 10204 Zeugnisse bei jeder Lieferung inklusive.', en:'Custom aluminum profiles are extruded on one of Europe\'s most modern mid-sized presses. Standard steel profiles are sourced from certified mills. EN 10204 certificates included with every delivery.', fr:'Les profilés aluminium sur mesure sont extrudés sur l\'une des presses les plus modernes d\'Europe. Certificats EN 10204 inclus.', pl:'Profile aluminiowe produkowane na jednej z najnowocześniejszych pras w Europie. Świadectwa EN 10204 w każdej dostawie.', es:'Los perfiles de aluminio se extruyen en una de las prensas más modernas de Europa. Certificados EN 10204 incluidos.' },
        'process.s4.desc':     { de:'Koordinierte Logistik bis zu Ihrem Standort. Verfolgen Sie Ihren Auftragsstatus und erhalten Sie Lieferbestätigungen. Europaweites Liefernetzwerk.', en:'Coordinated logistics to your site. Track your order status and receive delivery confirmations. Europe-wide delivery network.', fr:'Logistique coordonnée jusqu\'à votre site. Suivez votre commande et recevez des confirmations de livraison.', pl:'Skoordynowana logistyka do Twojej lokalizacji. Śledź status zamówienia. Europejska sieć dostaw.', es:'Logística coordinada a su sitio. Siga el estado de su pedido. Red de entrega en toda Europa.' },

        // About Extended
        'about.text1':         { de:'FERRON Trading wurde gegründet, um moderne Beschaffungslösungen für die Stahl- und Aluminiumindustrie zu bieten. Gestützt auf eine Familientradition in der Metallprofilfertigung und eine der leistungsfähigsten mittelgroßen Strangpressen Europas verbinden wir tiefes technisches Wissen mit zeitgemäßen Geschäftspraktiken.', en:'FERRON Trading was founded to bring modern procurement solutions to the steel and aluminum industry. Backed by a family legacy in metal profile manufacturing and one of Europe\'s most capable mid-sized extrusion presses, we combine deep technical knowledge with contemporary business practices.', fr:'FERRON Trading a été fondée pour apporter des solutions d\'approvisionnement modernes. Soutenue par un héritage familial et l\'une des presses d\'extrusion les plus performantes d\'Europe.', pl:'FERRON Trading została założona, aby oferować nowoczesne rozwiązania zaopatrzeniowe dla przemysłu stalowego i aluminiowego.', es:'FERRON Trading fue fundada para ofrecer soluciones de adquisición modernas para la industria del acero y aluminio.' },
        'about.text2':         { de:'Ob Sie Standard-Baustahl aus europäischen Walzwerken oder kundenspezifische Aluminium-Strangpressprofile für Fenster, Fassaden und Industrieanwendungen benötigen — wir liefern Präzisionsprofile zu wettbewerbsfähigen Preisen mit garantierter Qualität und vollständiger EN/DIN-Zertifizierung.', en:'Whether you need standard structural steel from European mills, or custom aluminum extrusions for windows, facades, and industrial applications — we deliver precision profiles at competitive prices with guaranteed quality and full EN/DIN certification.', fr:'Que vous ayez besoin d\'acier de construction standard ou de profilés aluminium sur mesure — nous livrons des profilés de précision à des prix compétitifs avec certification EN/DIN complète.', pl:'Niezależnie czy potrzebujesz standardowej stali konstrukcyjnej czy niestandardowych profili aluminiowych — dostarczamy profile precyzyjne z pełną certyfikacją EN/DIN.', es:'Ya sea que necesite acero estructural estándar o extrusiones de aluminio personalizadas — entregamos perfiles de precisión con certificación EN/DIN completa.' },
        'about.val1.title':    { de:'EN/DIN-Konform', en:'EN/DIN Compliant', fr:'Conforme EN/DIN', pl:'Zgodne z EN/DIN', es:'Conforme EN/DIN' },
        'about.val1.desc':     { de:'Alle Profile nach europäischen Normen', en:'All profiles to European standards', fr:'Tous les profilés aux normes européennes', pl:'Wszystkie profile wg norm europejskich', es:'Todos los perfiles según normas europeas' },
        'about.val2.title':    { de:'Moderne Presse', en:'Modern Press', fr:'Presse moderne', pl:'Nowoczesna prasa', es:'Prensa moderna' },
        'about.val2.desc':     { de:'Strangpresskapazität auf höchstem Niveau', en:'State-of-the-art extrusion capacity', fr:'Capacité d\'extrusion de pointe', pl:'Najnowocześniejsza zdolność wytłaczania', es:'Capacidad de extrusión de última generación' },
        'about.val3.title':    { de:'48h Angebote', en:'48h Quotes', fr:'Devis en 48h', pl:'Oferty w 48h', es:'Presupuestos en 48h' },
        'about.val3.desc':     { de:'Verbindliche Angebote innerhalb von zwei Werktagen', en:'Binding offers within two business days', fr:'Offres contraignantes sous deux jours ouvrables', pl:'Wiążące oferty w ciągu dwóch dni roboczych', es:'Ofertas vinculantes en dos días hábiles' },

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
        'trust.label':         { de:'Vertrauen Sie auf', en:'Trust in', fr:'Faites confiance à', pl:'Zaufaj', es:'Confíe en' },
        'trust.years':         { de:'Jahre Erfahrung', en:'Years Experience', fr:'Années d\'expérience', pl:'Lat doświadczenia', es:'Años de experiencia' },
        'trust.projects':      { de:'Projekte realisiert', en:'Projects Delivered', fr:'Projets réalisés', pl:'Zrealizowanych projektów', es:'Proyectos entregados' },
        'trust.ontime':        { de:'Termingerechte Lieferung', en:'On-Time Delivery', fr:'Livraison à temps', pl:'Dostawa na czas', es:'Entrega puntual' },
        'trust.defect':        { de:'Reklamationsquote (%)', en:'Defect Rate (%)', fr:'Taux de défaut (%)', pl:'Wskaźnik reklamacji (%)', es:'Tasa de defectos (%)' },
        'trust.industries':    { de:'Branchen:', en:'Industries:', fr:'Industries:', pl:'Branże:', es:'Industrias:' },
        'trust.ind1':          { de:'Fassadenbau', en:'Facade Systems', fr:'Façades', pl:'Fasady', es:'Fachadas' },
        'trust.ind2':          { de:'Fensterhersteller', en:'Window Manufacturers', fr:'Fabricants de fenêtres', pl:'Producenci okien', es:'Fabricantes de ventanas' },
        'trust.ind3':          { de:'Maschinenbau', en:'Mechanical Engineering', fr:'Construction mécanique', pl:'Budowa maszyn', es:'Ingeniería mecánica' },
        'trust.ind4':          { de:'Automobilzulieferer', en:'Automotive Suppliers', fr:'Fournisseurs automobiles', pl:'Dostawcy motoryzacyjni', es:'Proveedores automotrices' },
        'trust.ind5':          { de:'Möbelindustrie', en:'Furniture Industry', fr:'Industrie du meuble', pl:'Przemysł meblarski', es:'Industria del mueble' },
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
