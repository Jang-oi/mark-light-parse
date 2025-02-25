import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog.tsx';
import { useConfirmStore } from '@/store/confirmStore.ts';

export default function MarkConfirm() {
  const { open, title, description, cancelText, proceedText, closeConfirm, handleProceed } = useConfirmStore();

  return (
    <AlertDialog open={open} onOpenChange={closeConfirm}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={closeConfirm}>{cancelText}</AlertDialogCancel>
          <AlertDialogAction onClick={handleProceed}>{proceedText}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
