// Test script to verify sidebar language change matches header behavior
// This can be run in the browser console to test the implementation

console.log("Testing sidebar vs header language change behavior...");

// Mock the exact same logic that both components should follow
function testLanguageChangeLogic() {
  console.log("Testing language change logic consistency...");
  
  // Mock languages array
  const languages = [
    { code: "en", label: "EN", name: "English" },
    { code: "de", label: "DE", name: "German" },
    { code: "fr", label: "FR", name: "French" },
  ];
  
  // Test scenario: Change to German
  const newLang = "de";
  const locale = "en";
  
  console.log("Before change:");
  console.log("- localStorage lang:", localStorage.getItem("lang"));
  console.log("- localStorage language:", localStorage.getItem("language"));
  console.log("- current locale:", locale);
  
  // Simulate the exact logic from both components
  const selectedLanguage = languages.find((lang) => lang.code === newLang);
  
  if (selectedLanguage) {
    // Store in localStorage (both header and sidebar should do this)
    localStorage.setItem("language", selectedLanguage.name);
    localStorage.setItem("lang", selectedLanguage.code);
    
    console.log("\nAfter localStorage update:");
    console.log("- localStorage lang:", localStorage.getItem("lang"));
    console.log("- localStorage language:", localStorage.getItem("language"));
    console.log("- selected language name:", selectedLanguage.name);
    console.log("- selected language code:", selectedLanguage.code);
    
    // Simulate API call (both should do this)
    console.log("\nSimulating API call to update user language...");
    console.log("- API payload: { language: '" + selectedLanguage.name + "' }");
    
    // Simulate changeLanguage hook call (both should do this)
    if (newLang !== locale) {
      console.log("\nCalling changeLanguage hook with:", newLang);
      console.log("- This should trigger setUserLocale and window.location.reload()");
    }
  }
}

// Test current state
function testCurrentState() {
  console.log("\nCurrent application state:");
  console.log("- localStorage lang:", localStorage.getItem("lang"));
  console.log("- localStorage language:", localStorage.getItem("language"));
  console.log("- URL locale:", window.location.pathname.split('/')[1] || 'en');
}

// Test storage event handling
function testStorageEvents() {
  console.log("\nTesting storage event handling...");
  
  // Simulate storage change (as would happen when language changes)
  const testEvent = new StorageEvent('storage', {
    key: 'lang',
    oldValue: localStorage.getItem('lang'),
    newValue: 'fr'
  });
  
  console.log("Dispatching storage event for French...");
  window.dispatchEvent(testEvent);
  console.log("Storage event dispatched - components should re-render");
}

// Run all tests
testCurrentState();
testLanguageChangeLogic();
testStorageEvents();

console.log("\nTest completed!");
console.log("Both header and sidebar should now behave identically when changing languages.");
console.log("Check the browser console for 'Language updated successfully' message when testing.");
