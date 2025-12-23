interface ActivityItemProps {
  text: string;
  link?: string;
}

const ActivityItem = ({ text, link }: ActivityItemProps) => {
  const content = (
    <>
      <span className="text-coral-500 mr-2" aria-hidden="true">✱</span>
      <span className="text-gray-700">{text}</span>
      {link && (
        <>
          {' '}
          <a
            href={`https://instagram.com/${link.replace('@', '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 hover:text-coral-500 transition-colors"
          >
            {link}
          </a>
        </>
      )}
    </>
  );

  return (
    <li className="flex items-start">
      {content}
    </li>
  );
};

export default ActivityItem;
