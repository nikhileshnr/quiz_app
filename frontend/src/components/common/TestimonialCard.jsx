function TestimonialCard({ quote, name, title, avatar }) {
    return (
      <figure className="h-full flex flex-col justify-between bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50">
        <blockquote>
          <p className="text-lg leading-relaxed text-gray-300">"{quote}"</p>
        </blockquote>
        <figcaption className="mt-6 flex items-center gap-4">
          <img className="h-12 w-12 rounded-full object-cover" src={avatar} alt={name} />
          <div>
            <div className="font-bold text-white">{name}</div>
            <div className="text-sm text-gray-400">{title}</div>
          </div>
        </figcaption>
      </figure>
    );
  }
  
  export default TestimonialCard;
  