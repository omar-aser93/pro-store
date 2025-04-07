import Spinner from '@/components/spinner';

//Loading component: displays a loading spinner component while the page is loading
const Loading = () => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100vw', gap: '1rem', fontSize: '1.5rem', maxWidth: '100%' }} >
      .<Spinner />.      
    </div>
  );
};

export default Loading;