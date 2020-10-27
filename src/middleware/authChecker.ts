/*
 * Copyright (c) 2020. Mikhail Lazarev
 */

// create auth checker function
import { AuthChecker } from "type-graphql";
import { Context } from "./context";

export const authChecker: AuthChecker<Context> = (
  { context: { user } },
  roles
) => {
  if (roles.length === 0) {
    // if `@Authorized()`, check only is user exist
    return user !== undefined;
  }
  // there are some roles defined now

  if (!user) {
    // and if no user, restrict access
    return false;
  }
  if (roles.some((role) => roles.includes(role))) {
    // grant access if the roles overlap
    return true;
  }

  // no roles matched, restrict access
  return false;
};
