/**
 * Language options for project creation and onboarding
 * ISO 639-1 language codes
 */

export interface Language {
  code: string;
  name: string;
  nativeName?: string;
}

export const LANGUAGES: Language[] = [
  // United States first
  { code: "en", name: "United States", nativeName: "English" },
  
  // Czech second
  { code: "cs", name: "Czech", nativeName: "Čeština" },
  
  // All remaining languages sorted alphabetically
  { code: "ar", name: "Arabic", nativeName: "العربية" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা" },
  { code: "bg", name: "Bulgarian", nativeName: "Български" },
  { code: "zh", name: "Chinese", nativeName: "中文" },
  { code: "hr", name: "Croatian", nativeName: "Hrvatski" },
  { code: "da", name: "Danish", nativeName: "Dansk" },
  { code: "nl", name: "Dutch", nativeName: "Nederlands" },
  { code: "et", name: "Estonian", nativeName: "Eesti" },
  { code: "fi", name: "Finnish", nativeName: "Suomi" },
  { code: "fr", name: "French", nativeName: "Français" },
  { code: "de", name: "German", nativeName: "Deutsch" },
  { code: "el", name: "Greek", nativeName: "Ελληνικά" },
  { code: "he", name: "Hebrew", nativeName: "עברית" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी" },
  { code: "hu", name: "Hungarian", nativeName: "Magyar" },
  { code: "id", name: "Indonesian", nativeName: "Bahasa Indonesia" },
  { code: "it", name: "Italian", nativeName: "Italiano" },
  { code: "ja", name: "Japanese", nativeName: "日本語" },
  { code: "ko", name: "Korean", nativeName: "한국어" },
  { code: "lv", name: "Latvian", nativeName: "Latviešu" },
  { code: "lt", name: "Lithuanian", nativeName: "Lietuvių" },
  { code: "ms", name: "Malay", nativeName: "Bahasa Melayu" },
  { code: "no", name: "Norwegian", nativeName: "Norsk" },
  { code: "pl", name: "Polish", nativeName: "Polski" },
  { code: "pt", name: "Portuguese", nativeName: "Português" },
  { code: "ro", name: "Romanian", nativeName: "Română" },
  { code: "ru", name: "Russian", nativeName: "Русский" },
  { code: "sr", name: "Serbian", nativeName: "Српски" },
  { code: "sk", name: "Slovak", nativeName: "Slovenčina" },
  { code: "sl", name: "Slovenian", nativeName: "Slovenščina" },
  { code: "es", name: "Spanish", nativeName: "Español" },
  { code: "sv", name: "Swedish", nativeName: "Svenska" },
  { code: "th", name: "Thai", nativeName: "ไทย" },
  { code: "tr", name: "Turkish", nativeName: "Türkçe" },
  { code: "uk", name: "Ukrainian", nativeName: "Українська" },
  { code: "vi", name: "Vietnamese", nativeName: "Tiếng Việt" },
];

export const DEFAULT_LANGUAGE = "en";
