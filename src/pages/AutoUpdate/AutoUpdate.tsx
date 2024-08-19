// import { useEffect } from 'react';
// import { Button } from '@/components/ui/button.tsx';
// import { ipcRenderer } from 'electron';

const AutoUpdatePage = () => {
  // useEffect(() => {
  //   ipcRenderer.send('install_update');
  // }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-2xl font-semibold">Update Available</h1>
      <p className="mt-4">The update has been downloaded. The application will now restart to apply the update.</p>
      {/*<Button onClick={() => ipcRenderer.send('install_update')} className="mt-6">*/}
        Restart Now
      {/*</Button>*/}
    </div>
  );
};

export default AutoUpdatePage;
