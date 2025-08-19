import { getTranslations } from "next-intl/server";

// a simple footer component
const Footer = async () => {    
  const currentYear = new Date().getFullYear();            //get current year  
  const t = await getTranslations('Footer');               //get translation function for (Footer)
  return (
    <footer className='border-t'>
      <div className='p-5 flex-center'>
        {currentYear} {process.env.NEXT_PUBLIC_APP_NAME} &copy; {t('rights')}
      </div>          
    </footer>
  );
};
  
export default Footer;