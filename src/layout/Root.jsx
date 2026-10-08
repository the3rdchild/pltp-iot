import { Outlet, ScrollRestoration } from 'react-router-dom';

// ==============================|| ROOT LAYOUT ||============================== //
//
// Wraps every route for one reason: ScrollRestoration only sees navigations
// from inside the data router. The previous ScrollTop sat outside
// RouterProvider with an empty dependency array, so it fired once when the app
// booted and never again -- every client-side navigation inherited the scroll
// offset of the page before it.
//
// The default behaviour matches what a browser does with real page loads: top
// of the page on a new navigation, the previous offset on back/forward. A URL
// carrying a #hash scrolls that element into view instead, which is what keeps
// the landing page's in-page anchors working.
export default function RootLayout() {
  return (
    <>
      <ScrollRestoration />
      <Outlet />
    </>
  );
}
