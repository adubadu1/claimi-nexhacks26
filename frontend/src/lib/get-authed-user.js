/**
 * Resolve the signed-in user for client components.
 * Refreshes the session once if getUser fails (common after OAuth when the access token is stale).
 */
export async function getAuthedUser(client) {
  let {
    data: { user },
    error,
  } = await client.auth.getUser();

  if (error) {
    const { error: refreshError } = await client.auth.refreshSession();
    if (!refreshError) {
      const retry = await client.auth.getUser();
      user = retry.data.user;
      error = retry.error;
    }
  }

  if (error || !user) {
    const { data } = await client.auth.getSession();
    if (data?.session?.user) {
      return { user: data.session.user, error: null };
    }
  }

  return { user, error };
}
