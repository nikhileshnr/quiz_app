import { useState, useEffect, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import TestimonialCard from './TestimonialCard';

const testimonials = [
  {
    quote: "This is a game-changer for creating quizzes. The AI is incredibly fast and the manual editor gives me all the control I need. Highly recommended!",
    name: "Alex Johnson",
    title: "Educator & Tech Enthusiast",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d"
  },
  {
    quote: "I've tried many quiz apps, but QuizMaster AI stands out. The interface is beautiful and the features are powerful. It's my go-to for study materials.",
    name: "Samantha Lee",
    title: "University Student",
    avatar: "https://i.pravatar.cc/150?u=a04258114e29026702d"
  },
  {
    quote: "The ability to quickly generate quizzes on any topic has saved me hours of work. It's an essential tool for any professional looking to create assessments.",
    name: "Michael Chen",
    title: "Corporate Trainer",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026707d"
  },
  {
    quote: "A fantastic platform! Sharing quizzes with friends is seamless, and the friendly competition is a great motivator. The design is just the cherry on top.",
    name: "Jessica Williams",
    title: "Lifelong Learner",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026708d"
  }
];

const DotButton = ({ selected, onClick }) => (
    <button
      className={`h-3 w-3 rounded-full mx-1 transition-colors duration-200 ${selected ? 'bg-indigo-400' : 'bg-gray-600'}`}
      type="button"
      onClick={onClick}
    />
);

const PrevNextButton = ({ enabled, onClick, isPrev }) => (
    <button
      className="absolute top-1/2 -translate-y-1/2 rounded-full bg-gray-800/50 p-2 text-white transition-opacity disabled:opacity-30 hover:bg-gray-700"
      onClick={onClick}
      disabled={!enabled}
    >
      {isPrev ? <ChevronLeftIcon className="h-6 w-6" /> : <ChevronRightIcon className="h-6 w-6" />}
    </button>
);


function Testimonials() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start' });
  const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
  const [nextBtnEnabled, setNextBtnEnabled] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index) => emblaApi && emblaApi.scrollTo(index), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setPrevBtnEnabled(emblaApi.canScrollPrev());
    setNextBtnEnabled(emblaApi.canScrollNext());
  }, [emblaApi, setSelectedIndex]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);

  return (
    <section className="bg-gray-900 py-20 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-indigo-400">What People Are Saying</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Trusted by Creators and Learners
          </p>
        </div>
        
        <div className="relative mt-16">
            <div ref={emblaRef} className="overflow-hidden -mx-4">
            <div className="flex" style={{ marginLeft: 'calc(1rem * -1)' }}>
                {testimonials.map((testimonial, index) => (
                    <div className="flex-grow-0 flex-shrink-0 w-full md:w-1/2 lg:w-1/3" key={index} style={{ paddingLeft: '1rem' }}>
                        <TestimonialCard {...testimonial} />
                    </div>
                ))}
            </div>
            </div>

            <div className="absolute left-0 -translate-x-1/2">
                <PrevNextButton onClick={scrollPrev} enabled={prevBtnEnabled} isPrev={true} />
            </div>
            <div className="absolute right-0 translate-x-1/2">
                <PrevNextButton onClick={scrollNext} enabled={nextBtnEnabled} isPrev={false} />
            </div>
        </div>

        <div className="flex justify-center mt-8">
            {testimonials.map((_, index) => (
                <DotButton
                key={index}
                selected={index === selectedIndex}
                onClick={() => scrollTo(index)}
                />
            ))}
        </div>
      </div>
    </section>
  );
}

export default Testimonials; 