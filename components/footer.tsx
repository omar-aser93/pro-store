//simple footer component
const Footer = () => {    
  const currentYear = new Date().getFullYear();            //get current year  
  return (
    <footer className='border-t'>
      <div className='p-5 flex-center'>
        {currentYear} {process.env.NEXT_PUBLIC_APP_NAME}. All Rights reserved.
      </div>
    </footer>
  );
};
  
export default Footer;