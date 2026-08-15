// Test script to verify language sync functionality
// This can be run in the browser console to test the implementation

console.log("Testing language sync functionality...");

// Mock user data from API
const mockUser = {
  language: "German"
};

// Mock languages array (same as in countries.tsx)
const languages = [
  { code: "en", label: "EN", name: "English", flag: "🇺🇸" },
  { code: "nl", label: "NL", name: "Dutch", flag: "🇳🇱" },
  { code: "de", label: "DE", name: "German", flag: "🇩🇪" },
  { code: "fr", label: "FR", name: "French", flag: "🇫🇷" },
  { code: "es", label: "ES", name: "Spanish", flag: "🇪🇸" },
];

// Simulate the language sync logic (always update from API)
function syncLanguageFromAPI(user, isLoggedIn) {
  if (user?.language && isLoggedIn) {
    // Find language code from language name
    const userLanguage = languages.find(lang => lang.name === user.language);
    if (userLanguage) {
      // Always update localStorage to ensure API language takes precedence
      localStorage.setItem("language", userLanguage.name);
      localStorage.setItem("lang", userLanguage.code);
      console.log("Language synced from API:", userLanguage.name, userLanguage.code);
      return true;
    }
  }
  return false;
}

// Test the sync
console.log("Before sync:", {
  language: localStorage.getItem("language"),
  lang: localStorage.getItem("lang")
});

const wasSynced = syncLanguageFromAPI(mockUser, true);

console.log("After sync:", {
  language: localStorage.getItem("language"),
  lang: localStorage.getItem("lang"),
  wasSynced
});

// Test language dialog current language display logic
function getCurrentLanguageDisplay(locale) {
  const currentLangCode = localStorage.getItem("lang") || locale;
  const currentLang = languages.find((lang) => lang.code === currentLangCode) ?? languages[0];
  return currentLang;
}

const currentDisplay = getCurrentLanguageDisplay("en");
console.log("Current language display:", currentDisplay);

console.log("Test completed!");
