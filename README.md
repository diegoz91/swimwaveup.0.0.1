# 🏊‍♂️ SwimWaveUp (SwimIn)

**Il primo Social Network Professionale dedicato esclusivamente al mondo del nuoto.**

SwimWaveUp connette Istruttori FIN, Assistenti Bagnanti, Allenatori, Direttori Sportivi e Strutture (Piscine e Centri Sportivi) in un'unica piattaforma dinamica. Pensato come il "LinkedIn del nuoto", facilita il networking, la condivisione di competenze e l'incrocio tra domanda e offerta di lavoro nel settore acquatico.

![Stato](https://img.shields.io/badge/Stato-Production_Ready-success)
![Versione](https://img.shields.io/badge/Versione-1.0.0-blue)
![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=white)
![Appwrite](https://img.shields.io/badge/Backend-Appwrite-FD366E?logo=appwrite&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css&logoColor=white)

---

## ✨ Funzionalità Principali (Core Features)

### 👤 Profili "Passaporto Natatorio"
- **Due tipologie di account**: *Professionista* (Istruttore/Bagnino) e *Struttura* (Piscina).
- **Smart Badges Visivi**: Il sistema rileva automaticamente certificazioni ufficiali (es. "FIN", "Salvamento") e applica badge grafici immediati.
- **Timeline Carriera**: Visualizzazione elegante delle esperienze lavorative e dei brevetti con scadenze.
- **Facility View**: Le strutture hanno una vetrina dedicata che mostra automaticamente le posizioni lavorative aperte.

### 💬 Messaggistica Real-Time Enterprise
- **Chat Globale**: Widget in stile LinkedIn sempre accessibile in basso a destra (Desktop).
- **Latenza Zero (Optimistic UI)**: I messaggi appaiono istantaneamente nell'interfaccia prima ancora della conferma del server.
- **Typing Indicator**: Animazione "Sta scrivendo..." in tempo reale tramite WebSockets.
- **Read Receipts**: Spunte blu (✔✔) sincronizzate live e azzeramento globale delle notifiche.

### 🤝 Network & Connessioni
- Richieste di collegamento bidirezionali (Invia, Accetta, Rifiuta).
- Suggerimenti di rete intelligenti ("Potresti conoscere...") basati sui profili recenti, che includono sia colleghi che Strutture Sportive.

### 📰 Feed & Condivisione (Home)
- Condivisione di Post (testo e foto/media salvati in Cloud Storage).
- Sistema di "Consiglia" (Like) e Commenti nidificati.
- Vista Dettaglio Post fluida per commentare senza interruzioni di navigazione (SPA pura).

### 💼 Bacheca Lavoro
- Le strutture possono pubblicare annunci di ricerca personale (Bagnini, Istruttori, ecc.).
- I professionisti possono candidarsi con un click.

---

## 🛠️ Stack Tecnologico

**Frontend:**
- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/) (Build tool ultrarapido)
- [Tailwind CSS v3.4](https://tailwindcss.com/) + PostCSS (Styling)
- [React Router v6](https://reactrouter.com/) (Navigazione)

**Backend (BaaS):**
- [Appwrite Cloud](https://appwrite.io/)
  - **Auth**: Gestione sessioni e sicurezza.
  - **Databases (MariaDB)**: Collezioni relazionali per Profili, Post, Messaggi, Jobs.
  - **Storage**: Bucket per Avatar e Media dei Post.
  - **Realtime**: Connessioni WebSocket per feed e chat istantanee.
  - **Document Security**: Protezione E2E/Rest per la privacy della messaggistica.

---

## 🚀 Installazione e Avvio Locale

### 1. Clonare il repository
```bash
git clone **link**
cd swimwaveup