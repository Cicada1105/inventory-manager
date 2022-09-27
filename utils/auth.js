import { withIronSessionSsr } from "iron-session/next";
import { ironOptions } from './config.js'

export default function authenticateUser(serverSidePageFunction) {
  return withIronSessionSsr(
    async function getServerSideProps(context) {
      // Obtain request parameter from context
      let { req } = context;
      
      // Check if user object is available
      if (req.session?.user)
        return serverSidePageFunction(context);
      else  // User is not logged i
        return {
          redirect: {
            destination: "/login/",
            permanent: true
          }
        }
    },
    ironOptions
  );
}