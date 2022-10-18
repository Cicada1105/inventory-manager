import { withIronSessionSsr } from "iron-session/next";
import { ironOptions } from './config.js'

export default function authenticateUser(serverSidePageFunction) {
  return withIronSessionSsr(
    async function getServerSideProps(context) {
      // Obtain request parameter from context
      let { req } = context;
      
      // Check if user object is available
      if (req.session?.user) // User is successfully logged in
        // Authorize user's access
        return authorizeUser(context, serverSidePageFunction);
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
// Authorize User function restricts the currently logged in user based on their access level
function authorizeUser(context, callback) {
  let { req, resolvedUrl } = context;

  let user = req.session.user;
  // Retrieve users permissions for current page
  let paths = resolvedUrl.split("/"); // ['',page,operation[?query]]
  // Store the page that the user is trying to access
  let page = paths[1];
  // Check if there is a query: url = /url/path?query -> then remove query
  let hasUrlQuery = Object.keys(context.query).length !== 0;
  let operation = hasUrlQuery ? paths[2].split("?")[0] : paths[2];

  let userPageRestrictions = user.restrictions[page];
  // Store action user is attempting to access
  let access;
  switch(operation) {
    case "new":
      access = "create";
      break;
    case "list":
      if ((paths[1] === "inventory") && (user.access_type === "Basic User")) // Basic users currently have limited access
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
  //  note: all users have access to the home ("/") page and the my_work_orders page
  if ((resolvedUrl === "/") || (resolvedUrl.startsWith("/my_work_orders")) || (resolvedUrl === "/work_orders/new") || user.restrictions[page]?.includes(access))
    return callback(context);
  else
    return {
      redirect: {
        destination: "/403",
        permanent: false
      }
    }
}