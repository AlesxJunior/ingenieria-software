import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface ModalContextType {
  openModal: (content: ReactNode, title?: string, size?: 'small' | 'medium' | 'large' | 'fullscreen') => void;
  closeModal: () => void;
  isModalOpen: boolean;
  modalContent: ReactNode;
  modalTitle?: string;
  modalSize: 'small' | 'medium' | 'large' | 'fullscreen';
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

interface ModalProviderProps {
  children: ReactNode;
}

export const ModalProvider: React.FC<ModalProviderProps> = ({ children }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<ReactNode>(null);
  const [modalTitle, setModalTitle] = useState<string | undefined>(undefined);
  const [modalSize, setModalSize] = useState<'small' | 'medium' | 'large' | 'fullscreen'>('medium');

  const openModal = (
    content: ReactNode, 
    title?: string, 
    size: 'small' | 'medium' | 'large' | 'fullscreen' = 'medium'
  ) => {
    setModalContent(content);
    setModalTitle(title);
    setModalSize(size);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalContent(null);
    setModalTitle(undefined);
    setModalSize('medium');
  };

  return (
    <ModalContext.Provider
      value={{
        openModal,
        closeModal,
        isModalOpen,
        modalContent,
        modalTitle,
        modalSize
      }}
    >
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};