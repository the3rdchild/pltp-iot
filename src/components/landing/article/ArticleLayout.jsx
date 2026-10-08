import PropTypes from 'prop-types';

import PageHero from '../about/PageHero';
import SiteLayout from '../SiteLayout';

/**
 * Chrome shared by every article page.
 *
 * The articles used to carry their own navigation: a fixed "Kembali" button and
 * a sidebar that only opened on `onMouseEnter`, which no touch device fires. A
 * reader on a phone had no way into it. They also styled themselves through
 * `<style jsx>` blocks, and styled-jsx is not installed in this project, so
 * React emitted those rules as plain global CSS that restyled the header and
 * footer around them. Both problems go away by sitting inside SiteLayout and
 * composing `Section` below this hero.
 */
export default function ArticleLayout({ eyebrow, title, lead, children }) {
  return (
    <SiteLayout>
      <PageHero eyebrow={eyebrow} title={title} lead={lead} />
      {children}
    </SiteLayout>
  );
}

ArticleLayout.propTypes = {
  eyebrow: PropTypes.string,
  title: PropTypes.node.isRequired,
  lead: PropTypes.node,
  children: PropTypes.node
};
