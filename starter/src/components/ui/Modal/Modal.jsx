import { Fragment } from 'react';
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";

export function Modal({ open, onClose, children, className = '' }) {
  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-[100]" onClose={onClose}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className={`w-full max-w-md transform overflow-hidden rounded-2xl bg-card border border-divider text-left align-middle shadow-xl transition-all ${className}`}>
                {children}
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

export function ModalHeader({ children, className = "" }) {
  return (
    <div className={`px-6 py-4 border-b border-divider ${className}`}>
      <h3 className="text-lg font-semibold text-foreground">{children}</h3>
    </div>
  );
}

export function ModalBody({ children, className = "" }) {
  return (
    <div className={`px-6 py-4 text-sm text-foreground ${className}`}>
      {children}
    </div>
  );
}

export function ModalFooter({ children, className = "" }) {
  return (
    <div className={`px-6 py-4 border-t border-divider bg-black/20 flex justify-end gap-3 ${className}`}>
      {children}
    </div>
  );
}
