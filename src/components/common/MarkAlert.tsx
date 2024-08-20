import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog.tsx';
import { useAlertStore } from '@/store/alertStore.ts';

export default function MarkAlert() {
  const { open, title, description, closeAlert, closeCallBack = () => {} } = useAlertStore();

  return (
    <AlertDialog open={open} onOpenChange={closeAlert}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
          <AlertDialogAction onClick={closeCallBack}>확인</AlertDialogAction>
        </AlertDialogHeader>
      </AlertDialogContent>
    </AlertDialog>
  );
}
