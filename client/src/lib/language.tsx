import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, LANGUAGES } from '@shared/schema';
import { apiRequest } from './queryClient';

// Translation structure
type LanguageStrings = {
  [key: string]: string;
};

type Translations = {
  [section: string]: {
    en: LanguageStrings;
    pt: LanguageStrings;
  };
};

// Initial translations - will be loaded from the server
const initialTranslations: Translations = {
  common: {
    en: { common: 'common' },
    pt: { common: 'comum' }
  }
};

// Define the context type
interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  translations: Translations;
  isLoading: boolean;
}

// Create the context
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Props for the provider
interface LanguageProviderProps {
  children: ReactNode;
}

// Language Provider component
export function LanguageProvider({ children }: LanguageProviderProps) {
  // Get the stored language or use default (english)
  const [language, setLanguageState] = useState<Language>(() => {
    const stored = localStorage.getItem('language');
    return (stored as Language) || 'en';
  });
  
  const [translations, setTranslations] = useState<Translations>(initialTranslations);
  const [isLoading, setIsLoading] = useState(true);

  // Set language and store in localStorage
  const setLanguage = (lang: Language) => {
    if (LANGUAGES.includes(lang)) {
      localStorage.setItem('language', lang);
      setLanguageState(lang);
    }
  };

  // Translate a key
  const t = (key: string): string => {
    const parts = key.split('.');
    
    if (parts.length === 1) {
      // Simple key lookup in all translations
      for (const section in translations) {
        if (translations[section]?.[language]?.[key]) {
          return translations[section][language][key];
        }
      }
      // Key not found, return the key itself
      return key;
    } else {
      // Nested keys like "common.welcome"
      const section = parts[0];
      const translationKey = parts[1];
      
      if (translations[section]?.[language]?.[translationKey]) {
        return translations[section][language][translationKey];
      }
      
      // Key not found, return the full key
      return key;
    }
  };

  // Load translations from the server
  useEffect(() => {
    const fetchTranslations = async () => {
      try {
        setIsLoading(true);
        // Use the revised apiRequest with proper typing
        const data = await apiRequest<Translations>('/api/translations');
        if (data) {
          setTranslations(data);
        }
      } catch (error) {
        console.error('Failed to load translations:', error);
        // Fallback to default translations on error
        setTranslations(defaultTranslations as Translations);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTranslations();
  }, []);

  // Create context value
  const contextValue: LanguageContextType = {
    language,
    setLanguage,
    t,
    translations,
    isLoading
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
}

// Hook for using the language context
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

// Default translations for common UI components
export const defaultTranslations = {
  common: {
    en: {
      welcome: 'Welcome',
      login: 'Login',
      register: 'Register',
      logout: 'Logout',
      profile: 'Profile',
      home: 'Home',
      back: 'Back',
      save: 'Save',
      cancel: 'Cancel',
      submit: 'Submit',
      search: 'Search',
      loading: 'Loading...',
      documentLost: 'Report Lost',
      documentFound: 'Report Found',
      settings: 'Settings',
      language: 'Language',
      english: 'English',
      portuguese: 'Portuguese',
      darkMode: 'Dark Mode',
      notifications: 'Notifications',
      points: 'Points',
      subscription: 'Subscription',
      documents: 'Documents',
      errorLoadingDocuments: 'Failed to load your documents',
      switchLanguage: 'Switch Language',
      error: 'Error',
      pageNotFound: 'Page Not Found',
      pageNotFoundDesc: 'The page you are looking for does not exist or has been moved.',
      backToHome: 'Back to Home',
      welcomeToApp: 'Welcome to Find My Document',
      appIntro: 'Keep track of your important documents, report lost ones, and help others find their missing documents.',
      secureStorage: 'Secure Storage',
      reportLost: 'Report Lost',
      earnPoints: 'Earn Points',
      pointsInfo: 'Earn points by helping others find their lost documents.',
      current: 'Current',
      total: 'total',
      getStarted: 'Get Started',
      newUser: 'New User?',
      addYourFirstDocument: 'Add your first document to get started',
      helpGuidelines: 'Help Guidelines',
      reportingFoundItems: 'When reporting found items'
    },

    // Feature tour translations
    tour: {
      en: {
        next: 'Next',
        finish: 'Got it',
        skip: 'Skip',
        documentsTitle: 'Document Management',
        documentsDescription: 'Store your important documents securely. Add each document to protect them in case they get lost.',
        searchTitle: 'Search & Filter',
        searchDescription: 'Search for lost or found documents using filters to narrow down by type or location.',
        reportTitle: 'Report Lost or Found',
        reportDescription: 'Report your lost documents or help others by reporting found documents.',
        messagesTitle: 'Secure Messaging',
        messagesDescription: 'Chat securely with people who found your documents or whose documents you found.',
        pointsTitle: 'Earn Points',
        pointsDescription: 'Earn points by helping others. Points can be redeemed for subscription benefits.'
      },
      pt: {
        next: 'Próximo',
        finish: 'Entendi',
        skip: 'Pular',
        documentsTitle: 'Gerenciamento de Documentos',
        documentsDescription: 'Armazene seus documentos importantes com segurança. Adicione cada documento para protegê-los caso sejam perdidos.',
        searchTitle: 'Busca e Filtros',
        searchDescription: 'Pesquise documentos perdidos ou encontrados usando filtros para restringir por tipo ou localização.',
        reportTitle: 'Reportar Perdido ou Encontrado',
        reportDescription: 'Reporte seus documentos perdidos ou ajude outros reportando documentos encontrados.',
        messagesTitle: 'Mensagens Seguras',
        messagesDescription: 'Converse com segurança com pessoas que encontraram seus documentos ou cujos documentos você encontrou.',
        pointsTitle: 'Ganhe Pontos',
        pointsDescription: 'Ganhe pontos ajudando os outros. Os pontos podem ser trocados por benefícios de assinatura.'
      }
    },
    pt: {
      welcome: 'Bem-vindo',
      login: 'Entrar',
      register: 'Registrar',
      logout: 'Sair',
      profile: 'Perfil',
      home: 'Início',
      back: 'Voltar',
      save: 'Salvar',
      cancel: 'Cancelar',
      submit: 'Enviar',
      search: 'Pesquisar',
      loading: 'Carregando...',
      documentLost: 'Relatar Perda',
      documentFound: 'Relatar Encontrado',
      settings: 'Configurações',
      language: 'Idioma',
      english: 'Inglês',
      portuguese: 'Português',
      darkMode: 'Modo Escuro',
      notifications: 'Notificações',
      points: 'Pontos',
      subscription: 'Assinatura',
      documents: 'Documentos',
      errorLoadingDocuments: 'Falha ao carregar seus documentos',
      switchLanguage: 'Mudar Idioma',
      error: 'Erro',
      pageNotFound: 'Página Não Encontrada',
      pageNotFoundDesc: 'A página que você está procurando não existe ou foi movida.',
      backToHome: 'Voltar para o Início',
      welcomeToApp: 'Bem-vindo ao Find My Document',
      appIntro: 'Mantenha o controle de seus documentos importantes, reporte os perdidos e ajude outros a encontrar seus documentos.',
      secureStorage: 'Armazenamento Seguro',
      reportLost: 'Reportar Perdido',
      earnPoints: 'Ganhe Pontos',
      pointsInfo: 'Ganhe pontos ajudando outras pessoas a encontrarem seus documentos perdidos.',
      current: 'Atual',
      total: 'total'
    }
  },
  document: {
    en: {
      idCard: 'ID Card',
      driversLicense: 'Driver\'s License',
      passport: 'Passport',
      bankCard: 'Bank Card',
      status: 'Status',
      active: 'Active',
      lost: 'Lost',
      found: 'Found',
      documentNumber: 'Document Number',
      reportLost: 'Report Lost',
      reportFound: 'Report Found',
      description: 'Description',
      location: 'Location',
      foundAt: 'Found At',
      lostAt: 'Lost At',
      addNew: 'Add New Document',
      yourDocuments: 'Your Documents',
      noDocuments: 'No Documents Yet',
      startAdding: 'Start by adding your important documents for safekeeping',
      addFirst: 'Add Your First Document',
      documentMarkedLost: 'Document Marked as Lost',
      statusUpdated: 'Document Status Updated',
      documentMarkedLostDesc: 'Your document has been marked as lost. Others can now help you find it.',
      statusUpdatedDesc: 'Your document status has been updated.',
      errorUpdatingStatus: 'Failed to update document status',
      total: 'total',
      documentTip: 'Document Management Tips',
      documentManagementTip: 'Mark documents as lost to immediately report them to the community. Premium users can add unlimited documents.',
      type: 'Document Type',
      selectType: 'Select document type',
      enterDocumentNumber: 'Enter document number',
      nameOnDocument: 'Name on document',
      enterName: 'Enter full name as shown on document',
      lostLocation: 'Where did you lose it?',
      enterLocation: 'Enter the location where you lost it',
      locationDesc: 'Be as specific as possible to help others find it',
      additionalDetails: 'Additional details',
      enterDetails: 'Add any details that might help identify your document',
      detailsDesc: 'Include distinguishing features or circumstances',
      uploadImage: 'Upload image (optional)',
      changeImage: 'Change image',
      dragOrClick: 'Drag & drop or click to upload',
      imageRestrictions: 'JPG, PNG • Max 5MB',
      imageRecommendation: 'A photo helps others identify your document faster',
      privacyWarning: 'For privacy reasons, blur or hide sensitive information like ID numbers',
      reportSubmitted: 'Report Submitted',
      reportSubmittedDesc: 'Your lost document has been reported successfully',
      reportError: 'Failed to submit report',
      submitting: 'Submitting...',
      submitReport: 'Submit Report',
      reportTip: 'Tips for Lost Document Reports',
      reportHint: 'Providing accurate details increases your chances of recovery. Remember to include specific location information.',
      lostFeedTitle: 'Lost Documents',
      welcomeToLostFeed: 'Welcome to the Lost Documents Feed',
      lostFeedIntro: 'Here you can find documents reported as lost by others. Search, filter, or report your own lost document.',
      findStep: 'Find documents',
      locateStep: 'Check location details',
      contactStep: 'Contact the finder',
      recentlyReported: 'Recently Reported Lost',
      documentsFound: 'documents found',
      noLostDocuments: 'No Lost Documents Found',
      noReportedDocuments: 'No documents have been reported lost yet.',
      adjustFilters: 'Try adjusting your search filters.',
      reportYourLostDocument: 'Report Your Lost Document',
      errorLoadingLost: 'Failed to load lost documents',
      imageUploaded: 'Image Uploaded',
      imageUploadedDesc: 'Your image has been uploaded successfully',
      imageUploadError: 'Failed to upload image',
      imageTooLarge: 'Image size exceeds the 5MB limit',
      
      // Found documents section
      foundLocation: 'Where did you find it?',
      enterFoundLocation: 'Enter the location where you found it',
      enterFoundDetails: 'Describe the document you found',
      foundDetailsDesc: 'Include any visible information that might help identify the document',
      contactInfo: 'Your contact information',
      enterContactInfo: 'Enter your phone number or other contact details',
      contactInfoDesc: 'This will be shared with the document owner if they claim it',
      foundReportTip: 'Tips for Found Document Reports',
      foundReportHint: 'Thank you for helping! Providing accurate details helps return documents to their owners faster.',
      foundReportSubmitted: 'Found Document Report Submitted',
      foundReportSubmittedDesc: 'Thank you for your report! The document has been added to the found feed.',
      submitFoundReport: 'Submit Found Report',
      foundImageRecommendation: 'A photo helps the owner identify their document',
      foundPrivacyNote: 'Please protect privacy - blur or cover sensitive information in any photos',
      foundFeedTitle: 'Found Documents',
      welcomeToFoundFeed: 'Welcome to the Found Documents Feed',
      foundFeedIntro: 'Here you can find documents that have been found and reported by others. If you\'ve lost something, check here or report what you found.',
      inspectStep: 'Inspect documents',
      locateFoundStep: 'Note location details',
      reportFoundStep: 'Report found item',
      recentlyFound: 'Recently Found Documents',
      noFoundDocuments: 'No Found Documents Yet',
      noReportedFoundDocuments: 'No documents have been reported as found yet.',
      reportFoundDocument: 'Report a Found Document',
      errorLoadingFound: 'Failed to load found documents'
    },
    pt: {
      idCard: 'Carteira de Identidade',
      driversLicense: 'Carteira de Motorista',
      passport: 'Passaporte',
      bankCard: 'Cartão Bancário',
      status: 'Estado',
      active: 'Ativo',
      lost: 'Perdido',
      found: 'Encontrado',
      documentNumber: 'Número do Documento',
      reportLost: 'Reportar Perda',
      reportFound: 'Reportar Encontrado',
      description: 'Descrição',
      location: 'Localização',
      foundAt: 'Encontrado Em',
      lostAt: 'Perdido Em',
      addNew: 'Adicionar Novo Documento',
      yourDocuments: 'Seus Documentos',
      noDocuments: 'Nenhum Documento Ainda',
      startAdding: 'Comece adicionando seus documentos importantes para mantê-los seguros',
      addFirst: 'Adicione Seu Primeiro Documento',
      documentMarkedLost: 'Documento Marcado como Perdido',
      statusUpdated: 'Status do Documento Atualizado',
      documentMarkedLostDesc: 'Seu documento foi marcado como perdido. Outros podem ajudá-lo a encontrá-lo agora.',
      statusUpdatedDesc: 'O status do seu documento foi atualizado.',
      errorUpdatingStatus: 'Falha ao atualizar o status do documento',
      total: 'total',
      documentTip: 'Dicas de Gerenciamento de Documentos',
      documentManagementTip: 'Marque documentos como perdidos para relatá-los imediatamente à comunidade. Usuários premium podem adicionar documentos ilimitados.',
      type: 'Tipo de Documento',
      selectType: 'Selecione o tipo de documento',
      enterDocumentNumber: 'Digite o número do documento',
      nameOnDocument: 'Nome no documento',
      enterName: 'Digite o nome completo como está no documento',
      lostLocation: 'Onde você o perdeu?',
      enterLocation: 'Digite o local onde você o perdeu',
      locationDesc: 'Seja o mais específico possível para ajudar outros a encontrá-lo',
      additionalDetails: 'Detalhes adicionais',
      enterDetails: 'Adicione quaisquer detalhes que possam ajudar a identificar seu documento',
      detailsDesc: 'Inclua características distintivas ou circunstâncias',
      uploadImage: 'Enviar imagem (opcional)',
      changeImage: 'Trocar imagem',
      dragOrClick: 'Arraste e solte ou clique para enviar',
      imageRestrictions: 'JPG, PNG • Máx 5MB',
      imageRecommendation: 'Uma foto ajuda outros a identificarem seu documento mais rapidamente',
      privacyWarning: 'Por razões de privacidade, desfoque ou esconda informações sensíveis como números de identificação',
      reportSubmitted: 'Relatório Enviado',
      reportSubmittedDesc: 'Seu documento perdido foi reportado com sucesso',
      reportError: 'Falha ao enviar relatório',
      submitting: 'Enviando...',
      submitReport: 'Enviar Relatório',
      reportTip: 'Dicas para Relatos de Documentos Perdidos',
      reportHint: 'Fornecer detalhes precisos aumenta suas chances de recuperação. Lembre-se de incluir informações específicas de localização.',
      lostFeedTitle: 'Documentos Perdidos',
      welcomeToLostFeed: 'Bem-vindo ao Feed de Documentos Perdidos',
      lostFeedIntro: 'Aqui você pode encontrar documentos reportados como perdidos por outras pessoas. Pesquise, filtre ou reporte seu próprio documento perdido.',
      findStep: 'Encontrar documentos',
      locateStep: 'Verificar detalhes de localização',
      contactStep: 'Contatar o encontrador',
      recentlyReported: 'Recentemente Reportados como Perdidos',
      documentsFound: 'documentos encontrados',
      noLostDocuments: 'Nenhum Documento Perdido Encontrado',
      noReportedDocuments: 'Nenhum documento foi reportado como perdido ainda.',
      adjustFilters: 'Tente ajustar seus filtros de pesquisa.',
      reportYourLostDocument: 'Reporte Seu Documento Perdido',
      errorLoadingLost: 'Falha ao carregar documentos perdidos',
      imageUploaded: 'Imagem Enviada',
      imageUploadedDesc: 'Sua imagem foi enviada com sucesso',
      imageUploadError: 'Falha ao enviar imagem',
      imageTooLarge: 'O tamanho da imagem excede o limite de 5MB',
      
      // Found documents section
      foundLocation: 'Onde você o encontrou?',
      enterFoundLocation: 'Digite o local onde você o encontrou',
      enterFoundDetails: 'Descreva o documento que você encontrou',
      foundDetailsDesc: 'Inclua qualquer informação visível que possa ajudar a identificar o documento',
      contactInfo: 'Suas informações de contato',
      enterContactInfo: 'Digite seu número de telefone ou outros detalhes de contato',
      contactInfoDesc: 'Isso será compartilhado com o proprietário do documento caso ele o reivindique',
      foundReportTip: 'Dicas para Relatos de Documentos Encontrados',
      foundReportHint: 'Obrigado por ajudar! Fornecer detalhes precisos ajuda a devolver documentos aos seus donos mais rapidamente.',
      foundReportSubmitted: 'Relato de Documento Encontrado Enviado',
      foundReportSubmittedDesc: 'Obrigado pelo seu relato! O documento foi adicionado ao feed de encontrados.',
      submitFoundReport: 'Enviar Relato de Encontrado',
      foundImageRecommendation: 'Uma foto ajuda o proprietário a identificar seu documento',
      foundPrivacyNote: 'Por favor, proteja a privacidade - desfoque ou cubra informações sensíveis em fotos',
      foundFeedTitle: 'Documentos Encontrados',
      welcomeToFoundFeed: 'Bem-vindo ao Feed de Documentos Encontrados',
      foundFeedIntro: 'Aqui você pode encontrar documentos que foram encontrados e relatados por outras pessoas. Se você perdeu algo, verifique aqui ou relate o que encontrou.',
      inspectStep: 'Inspecionar documentos',
      locateFoundStep: 'Anotar detalhes do local',
      reportFoundStep: 'Reportar item encontrado',
      recentlyFound: 'Documentos Encontrados Recentemente',
      noFoundDocuments: 'Nenhum Documento Encontrado Ainda',
      noReportedFoundDocuments: 'Nenhum documento foi relatado como encontrado ainda.',
      reportFoundDocument: 'Relatar um Documento Encontrado',
      errorLoadingFound: 'Falha ao carregar documentos encontrados'
    }
  },
  subscription: {
    en: {
      free: 'Free Plan',
      monthly: 'Monthly',
      yearly: 'Yearly',
      price: 'Price',
      features: 'Features',
      currentPlan: 'Current Plan',
      subscribeTo: 'Subscribe to',
      cancel: 'Cancel Subscription',
      monthlyPrice: '$1.5 /month',
      yearlyPrice: '$10 /year',
      unlimitedDocuments: 'Unlimited Documents',
      prioritySupport: 'Priority Support',
      premiumFeatures: 'Premium Features',
      upgrade: 'Upgrade',
      idCardOnly: 'Only ID card storage available'
    },
    pt: {
      free: 'Plano Grátis',
      monthly: 'Mensal',
      yearly: 'Anual',
      price: 'Preço',
      features: 'Recursos',
      currentPlan: 'Plano Atual',
      subscribeTo: 'Assinar',
      cancel: 'Cancelar Assinatura',
      monthlyPrice: '1,5€ /mês',
      yearlyPrice: '10€ /ano',
      unlimitedDocuments: 'Documentos Ilimitados',
      prioritySupport: 'Suporte Prioritário',
      premiumFeatures: 'Recursos Premium',
      upgrade: 'Atualizar',
      idCardOnly: 'Apenas armazenamento de carteira de identidade disponível'
    }
  }
};