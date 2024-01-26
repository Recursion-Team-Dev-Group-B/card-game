import Image from 'next/image';

type Props = {
  url: string;
  alt: string;
  flipCard: () => void;
};

const CardImage = (props: Props) => {
  const { url, alt, flipCard } = props;

  const handleClick = () => {
    console.log('aa');
  };

  return (
    <img className="w-200 h-300" src={url} alt={alt} onMouseEnter={flipCard} />
  );
};

export default CardImage;
