import PropTypes from 'prop-types';

import prose from './Prose.module.css';

export default function Figure({ src, alt, caption }) {
  return (
    <figure className={prose.figure}>
      <img src={src} alt={alt} loading="lazy" />
      {caption && <figcaption className={prose.caption}>{caption}</figcaption>}
    </figure>
  );
}

Figure.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
  caption: PropTypes.node
};
