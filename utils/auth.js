import { withIronSessionSsr } from "iron-session/next";
import { ironOptions } from './config.js'

export default function authenticateUser(serverSidePageFunction) {
  return withIronSessionSsr(
    async function getServerSideProps(context) {
      // Obtain request parameter from context
      let { req, resolvedUrl } = context;
      
      // Check if user object is available
      if (req.session?.user) {
        let user = req.session.user;
        // Retrieve users permissions for current page
        let paths = resolvedUrl.split("/")
        let page = paths[1];
        let userPageRestrictions = user.restrictions[page];
        // Store action user is attempting to access
        let access;
        switch(paths[2]) {
          case "new":
            access = "create";
            break;
          case "list":
            if (paths[1] === "inventory") // Basic users currently have limited access
              access = "limited";
            else
              access = "read";
            break;
          case "update":
            access = "update";
            break;
          case "remove":
            access = "delete";
            break;
          default:
            access = "";
        }

        // Check if user has access to the current page
        if ((resolvedUrl === "/") || user.restrictions[page]?.includes(access))
          return serverSidePageFunction(context);
        else
          return {
            redirect: {
              destination: "/403",
              permanent: false
            }
          }
      }
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