# Raport Odbioru Lokalu — Instrukcja publikacji na GitHub Pages

Aplikacja jest w pełni skonfigurowana do działania na GitHub Pages bez problemu „białej strony”.

## Dlaczego wcześniej pojawiała się biała strona?
1. **GitHub Pages nie kompiluje kodu TypeScript/React bezpośrednio z gałęzi `main`**: Jeśli w ustawieniach repozytorium wybrano źródło `Deploy from a branch -> / (root)`, GitHub serwował nieprzetworzony plik `index.html` z odwołaniem do nieskompilowanego `main.tsx`.
2. **Workbox Navigation Route**: W konfiguracji Service Workera brakowało dopasowania relatywnego pliku `index.html`.
3. **Brak podkatalogu `/docs` w repozytorium**: Folder z gotową wersją produkcyjną nie był śledzony przez gita.

---

## 3 proste sposoby publikacji (wybierz jeden):

### Opcja 1 (Najprostsza — Folder `/docs` bez konfiguracji Actions)
1. Wypchnij kod do swojego repozytorium na GitHubie (`git add . && git commit -m "Aktualizacja" && git push`).
2. W swoim repozytorium na GitHubie przejdź do zakładki:
   **Settings** &rarr; **Pages**
3. W sekcji **Build and deployment**:
   - **Source**: `Deploy from a branch`
   - **Branch**: `main` (lub `master`)
   - **Folder**: zmień z `/ (root)` na **`/docs`**
4. Kliknij **Save**. Po około 1 minucie aplikacja będzie działać pod adresem `https://<twoj-login>.github.io/<nazwa-repozytorium>/`.

---

### Opcja 2 (W pełni automatyczna przez GitHub Actions)
1. W swoim repozytorium na GitHubie przejdź do zakładki:
   **Settings** &rarr; **Pages**
2. W sekcji **Build and deployment**:
   - Zmień **Source** z `Deploy from a branch` na **`GitHub Actions`**.
3. Przy każdym kolejnym `git push` plik `.github/workflows/deploy.yml` automatycznie zbuduje i opublikuje najnowszą wersję.

---

### Opcja 3 (Komenda `npm run deploy`)
W terminalu uruchom:
```bash
npm run deploy
```
Komenda automatycznie zbuduje aplikację i utworzy/zaktualizuje gałąź `gh-pages` na Twoim GitHubie.
W **Settings** &rarr; **Pages** wybierz wtedy gałąź **`gh-pages`** i folder **`/ (root)`**.
