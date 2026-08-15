// Test script to verify the language selection fixes
// This can be run in the browser console to test the implementation

console.log("Testing language selection fixes...");

// Test 1: Check if localStorage events are properly handled
function testLocalStorageSync() {
  console.log("Test 1: Testing localStorage sync...");
  
  // Set initial language
  localStorage.setItem("lang", "en");
  console.log("Initial language:", localStorage.getItem("lang"));
  
  // Simulate language change (as would happen in LanguageDialog)
  localStorage.setItem("lang", "de");
  console.log("After change to German:", localStorage.getItem("lang"));
  
  // Simulate storage event (as would happen from another tab)
  window.dispatchEvent(new StorageEvent('storage', {
    key: 'lang',
    oldValue: 'de',
    newValue: 'fr'
  }));
  
  console.log("Storage event dispatched for French");
}

// Test 2: Check language priority logic
function testLanguagePriority() {
  console.log("\nTest 2: Testing language priority logic...");
  
  // Mock languages array
  const languages = [
    { code: "en", label: "EN", name: "English" },
    { code: "de", label: "DE", name: "German" },
    { code: "fr", label: "FR", name: "French" },
  ];
  
  // Test priority: localStorage > locale
  localStorage.setItem("lang", "de");
  const locale = "en";
  
  const storedLang = localStorage.getItem("lang");
  const selectedLang = storedLang && languages.find(lang => lang.code === storedLang) 
    ? storedLang 
    : locale;
    
  console.log("Priority test - localStorage:", storedLang, "locale:", locale, "selected:", selectedLang);
}

// Test 3: Check current language display logic
function testCurrentLanguageDisplay() {
  console.log("\nTest 3: Testing current language display logic...");
  
  const languages = [
    { code: "en", label: "EN", name: "English" },
    { code: "de", label: "DE", name: "German" },
    { code: "fr", label: "FR", name: "French" },
  ];
  
  // Test with localStorage set
  localStorage.setItem("lang", "fr");
  const locale = "en";
  
  const currentLangCode = localStorage.getItem("lang") || locale;
  const currentLang = languages.find((lang) => lang.code === currentLangCode) ?? languages[0];
  
  console.log("Display test - localStorage:", localStorage.getItem("lang"), "locale:", locale);
  console.log("Current language display:", currentLang);
}

// Run all tests
testLocalStorageSync();
testLanguagePriority();
testCurrentLanguageDisplay();

console.log("\nAll tests completed! Check the console output for results.");
console.log("If the values are correct, the language selection should now update properly in the sidebar.");
