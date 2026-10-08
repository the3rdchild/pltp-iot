import PropTypes from 'prop-types';

import './styles/tokens.css';

import SiteFooter from './SiteFooter';
import SiteHeader from './SiteHeader';
import styles from './SiteLayout.module.css';

/**
 * Chrome shared by every public page.
 *
 * The `.page` class is what scopes the site's typography: the previous landing
 * page shipped its CSS in a `<style jsx>` block without styled-jsx installed,
 * so the rules were emitted globally and reached the dashboard too. Everything
 * here is either a CSS Module or bounded by this wrapper.
 */
export default function SiteLayout({ children }) {
  return (
    <div className={styles.page}>
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
    </div>
  );
}

SiteLayout.propTypes = { children: PropTypes.node };
