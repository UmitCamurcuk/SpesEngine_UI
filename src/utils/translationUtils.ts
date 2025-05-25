// Translation utility fonksiyonları
// Kullanıcının diline göre çeviri metinlerini getirmek için

export interface TranslationObject {
  _id: string;
  key: string;
  namespace: string;
  translations: Record<string, string>;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Translation objesinden kullanıcının diline göre metni getirir
 * @param translationObj - Translation objesi
 * @param currentLanguage - Kullanıcının mevcut dili
 * @param fallbackLanguage - Varsayılan dil (genellikle 'tr' veya 'en')
 * @returns Çeviri metni
 */
export const getTranslatedText = (
  translationObj: TranslationObject | null | undefined,
  currentLanguage: string,
  fallbackLanguage: string = 'tr'
): string => {
  if (!translationObj || !translationObj.translations) {
    return '';
  }

  // Önce kullanıcının dilini dene
  if (translationObj.translations[currentLanguage]) {
    return translationObj.translations[currentLanguage];
  }

  // Sonra fallback dilini dene
  if (translationObj.translations[fallbackLanguage]) {
    return translationObj.translations[fallbackLanguage];
  }

  // Son olarak mevcut olan ilk çeviriyi al
  const availableTranslations = Object.values(translationObj.translations);
  return availableTranslations.length > 0 ? availableTranslations[0] : '';
};

/**
 * Entity'nin name alanını kullanıcının diline göre getirir
 * @param entity - Name alanı olan entity
 * @param currentLanguage - Kullanıcının mevcut dili
 * @param fallbackLanguage - Varsayılan dil
 * @returns Name çevirisi
 */
export const getEntityName = (
  entity: { name?: TranslationObject | string } | null | undefined,
  currentLanguage: string,
  fallbackLanguage: string = 'tr'
): string => {
  if (!entity || !entity.name) {
    return '';
  }

  // Eğer name string ise (eski format), direkt döndür
  if (typeof entity.name === 'string') {
    return entity.name;
  }

  // Translation objesi ise çeviriyi getir
  return getTranslatedText(entity.name, currentLanguage, fallbackLanguage);
};

/**
 * Entity'nin description alanını kullanıcının diline göre getirir
 * @param entity - Description alanı olan entity
 * @param currentLanguage - Kullanıcının mevcut dili
 * @param fallbackLanguage - Varsayılan dil
 * @returns Description çevirisi
 */
export const getEntityDescription = (
  entity: { description?: TranslationObject | string } | null | undefined,
  currentLanguage: string,
  fallbackLanguage: string = 'tr'
): string => {
  if (!entity || !entity.description) {
    return '';
  }

  // Eğer description string ise (eski format), direkt döndür
  if (typeof entity.description === 'string') {
    return entity.description;
  }

  // Translation objesi ise çeviriyi getir
  return getTranslatedText(entity.description, currentLanguage, fallbackLanguage);
};

/**
 * Çoklu entity listesi için name çevirilerini getirir
 * @param entities - Entity listesi
 * @param currentLanguage - Kullanıcının mevcut dili
 * @param fallbackLanguage - Varsayılan dil
 * @returns Name çevirileri ile birlikte entity listesi
 */
export const getEntitiesWithTranslatedNames = <T extends { name?: TranslationObject | string }>(
  entities: T[],
  currentLanguage: string,
  fallbackLanguage: string = 'tr'
): (T & { translatedName: string })[] => {
  return entities.map(entity => ({
    ...entity,
    translatedName: getEntityName(entity, currentLanguage, fallbackLanguage)
  }));
};

/**
 * Çoklu entity listesi için name ve description çevirilerini getirir
 * @param entities - Entity listesi
 * @param currentLanguage - Kullanıcının mevcut dili
 * @param fallbackLanguage - Varsayılan dil
 * @returns Çeviriler ile birlikte entity listesi
 */
export const getEntitiesWithTranslations = <T extends { 
  name?: TranslationObject | string;
  description?: TranslationObject | string;
}>(
  entities: T[],
  currentLanguage: string,
  fallbackLanguage: string = 'tr'
): (T & { translatedName: string; translatedDescription: string })[] => {
  return entities.map(entity => ({
    ...entity,
    translatedName: getEntityName(entity, currentLanguage, fallbackLanguage),
    translatedDescription: getEntityDescription(entity, currentLanguage, fallbackLanguage)
  }));
}; 