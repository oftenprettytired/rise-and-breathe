// Rotating library of contemplative quotes for Rise & Breathe.
// `context` is a short original expansion (not a verbatim excerpt) offered
// behind "Read More" so the quote has somewhere to breathe.
const QUOTES = [
  {
    text: "Be here now.",
    author: "Ram Dass",
    source: "Be Here Now",
    context:
      "Ram Dass built an entire teaching around these three words: the past is a memory held in the present, the future is an imagination held in the present, and the only place life actually happens is this exact moment. Each breath you take today is an invitation back to it.",
  },
  {
    text: "We're all just walking each other home.",
    author: "Ram Dass",
    source: "Teachings on service",
    context:
      "For Ram Dass, spiritual life was never a solitary climb — it was companionship. However alone this quiet morning moment feels, it connects you to everyone else who is also, in their own way, trying to wake up and be kind along the way.",
  },
  {
    text: "The heart surrenders everything to the moment. The mind judges and holds back.",
    author: "Ram Dass",
    source: "Talks on love and awareness",
    context:
      "Ram Dass often distinguished the quick, comparing mind from the open, receiving heart. A breath practice is one of the few times each day the mind can rest and let the heart simply meet what's here.",
  },
  {
    text: "The most important thing is to be as loving as you can be, right where you're at.",
    author: "Ram Dass",
    source: "Polishing the Mirror",
    context:
      "This was Ram Dass's answer, again and again, to the question of how to live well: not a technique or a destination, just love, applied to whatever is in front of you, starting now.",
  },
  {
    text: "Treat everyone you meet like God in drag.",
    author: "Ram Dass",
    source: "Talks on presence",
    context:
      "Playful and irreverent, this line captures Ram Dass's core practice: seeing past appearances to the shared awareness underneath every person you encounter, including the one you'll meet in the mirror this morning.",
  },
  {
    text: "You are the sky. Everything else is just the weather.",
    author: "Ram Dass",
    source: "Talks on identity",
    context:
      "Moods, thoughts, and circumstances move through you like weather moves through sky — vivid, real, and temporary. The sky itself is never touched by the storm. This breath is a chance to notice what in you has always been sky.",
  },
  {
    text: "This is the real secret of life — to be completely engaged with what you are doing in the here and now.",
    author: "Alan Watts",
    source: "The Way of Zen",
    context:
      "Watts spent his life translating Eastern non-duality for a Western audience hungry for meaning. His central insight was disarmingly simple: life isn't a problem to solve elsewhere — it's fully available right where your attention already is.",
  },
  {
    text: "You are an aperture through which the universe is looking at and exploring itself.",
    author: "Alan Watts",
    source: "Out of Your Mind",
    context:
      "Watts loved dissolving the illusion of separateness. You didn't come into this world — you grew out of it, the way a wave grows out of the ocean. This morning's breath is the universe, breathing.",
  },
  {
    text: "Muddy water is best cleared by leaving it alone.",
    author: "Alan Watts",
    source: "The Wisdom of Insecurity",
    context:
      "So much of Watts's teaching pointed at effortless effort — the way clarity returns not by force but by stillness. A racing mind, like muddy water, settles on its own when you simply stop stirring it.",
  },
  {
    text: "The only way to make sense out of change is to plunge into it, move with it, and join the dance.",
    author: "Alan Watts",
    source: "The Wisdom of Insecurity",
    context:
      "Watts saw resistance to change as the real source of suffering, not change itself. Each inhale and exhale is a small rehearsal for this — arriving, releasing, trusting the next breath will come.",
  },
  {
    text: "This actual moment is the only moment in your control.",
    author: "Alan Watts",
    source: "Talks on time",
    context:
      "Watts often pointed out that we live almost entirely in memory and anticipation, forfeiting the one moment we actually have any say over. Practicing presence is simply practicing where your power actually lives.",
  },
  {
    text: "Trying to define yourself is like trying to bite your own teeth.",
    author: "Alan Watts",
    source: "Talks on the self",
    context:
      "A favorite Watts image for the futility of the grasping, self-conscious mind. Some things — including who you are — are known by resting into them, not by seizing them.",
  },
  {
    text: "Realize deeply that the present moment is all you ever have.",
    author: "Eckhart Tolle",
    source: "The Power of Now",
    context:
      "This is close to the founding sentence of Tolle's teaching. Every worry lives in an imagined future; every regret lives in a remembered past. The present moment, however plain, is the only place that has ever actually existed.",
  },
  {
    text: "The primary cause of unhappiness is never the situation but your thoughts about it.",
    author: "Eckhart Tolle",
    source: "The Power of Now",
    context:
      "Tolle distinguishes what happens from the story the mind immediately tells about what happens. Breathwork is a way of loosening that second layer, so life can be met a little more directly.",
  },
  {
    text: "Wherever you are, be there totally.",
    author: "Eckhart Tolle",
    source: "The Power of Now",
    context:
      "A simple instruction that turns out to be one of the hardest practices there is — most of us are only ever partly wherever we happen to be. This ritual is a small daily rehearsal for full arrival.",
  },
  {
    text: "Life is the dancer and you are the dance.",
    author: "Eckhart Tolle",
    source: "A New Earth",
    context:
      "Tolle uses this image to dissolve the sense of being a separate self battling against life. You are not standing apart from your experience, watching it happen — you are the very movement of it.",
  },
  {
    text: "Some changes look negative on the surface but you will soon realize that space is being created in your life for something new to emerge.",
    author: "Eckhart Tolle",
    source: "Stillness Speaks",
    context:
      "A gentle reminder for whatever this morning holds. Tolle often taught that discomfort is frequently just the felt sense of old structure dissolving to make room for something more alive.",
  },
  {
    text: "Awareness is the greatest agent for change.",
    author: "Eckhart Tolle",
    source: "The Power of Now",
    context:
      "Tolle's teaching rests on a quiet but radical claim: you don't have to force yourself to change — you simply have to become fully aware of what is, and transformation follows on its own.",
  },
  {
    text: "Before enlightenment, chop wood, carry water. After enlightenment, chop wood, carry water.",
    author: "Zen proverb",
    source: "Zen teaching tale",
    context:
      "A classic Zen saying about the ordinary nature of awakening. Enlightenment doesn't exempt you from daily life — it simply changes how fully you show up for it. This breath is your wood, your water, this morning.",
  },
  {
    text: "When walking, walk. When eating, eat.",
    author: "Zen proverb",
    source: "Attributed to Zen master Ummon",
    context:
      "Zen delights in instructions so simple they almost sound like jokes — until you notice how rarely you actually do only one thing at a time. Try it now: when breathing, just breathe.",
  },
  {
    text: "Sitting quietly, doing nothing, spring comes, and the grass grows by itself.",
    author: "Zen proverb",
    source: "Traditional Zen verse",
    context:
      "A picture of wu wei — effortless unfolding. Nothing about this morning's stillness needs to be forced. Left alone, the mind settles the way a season simply, inevitably, arrives.",
  },
  {
    text: "The obstacle is the path.",
    author: "Zen proverb",
    source: "Traditional Zen saying",
    context:
      "Zen rarely frames difficulty as something to route around. Whatever resistance shows up in this breath — restlessness, a wandering mind — is not separate from the practice. It is the practice.",
  },
  {
    text: "You are perfect as you are, and you could use a little improvement.",
    author: "Shunryu Suzuki",
    source: "Zen Mind, Beginner's Mind",
    context:
      "Suzuki Roshi held both truths at once without contradiction: complete acceptance of this moment, and quiet, ongoing effort. That paradox is the whole of gentle practice — no self-punishment required.",
  },
  {
    text: "In the beginner's mind there are many possibilities, but in the expert's mind there are few.",
    author: "Shunryu Suzuki",
    source: "Zen Mind, Beginner's Mind",
    context:
      "Suzuki's most famous teaching is an invitation to meet even a familiar morning ritual as if for the first time — curious, open, unburdened by what you think you already know about your own breath.",
  },
  {
    text: "The Tao that can be spoken is not the eternal Tao.",
    author: "Lao Tzu",
    source: "Tao Te Ching, Chapter 1",
    context:
      "The opening line of the Tao Te Ching warns that the deepest truths slip through language. Breathwork is one way around that problem — a way of knowing something directly, without needing to explain it.",
  },
  {
    text: "Nature does not hurry, yet everything is accomplished.",
    author: "Lao Tzu",
    source: "Tao Te Ching",
    context:
      "A central image of wu wei, or effortless action. Trees don't strain to grow. Rivers don't force their way to the sea. This ritual asks for the same unhurried trust — let the breath do what breath already knows how to do.",
  },
  {
    text: "Knowing others is wisdom, knowing yourself is enlightenment.",
    author: "Lao Tzu",
    source: "Tao Te Ching, Chapter 33",
    context:
      "The Tao Te Ching consistently turns attention inward before outward. A few quiet minutes of noticing your own breath is, in its small way, this exact practice.",
  },
  {
    text: "Do the difficult things while they are easy and the great things while they are small.",
    author: "Lao Tzu",
    source: "Tao Te Ching, Chapter 63",
    context:
      "Lao Tzu's counsel on beginnings: the small, consistent gesture — a few minutes of breath each morning — is how vast change is actually made, long before it looks vast.",
  },
  {
    text: "A good traveler has no fixed plans and is not intent upon arriving.",
    author: "Lao Tzu",
    source: "Tao Te Ching, Chapter 27",
    context:
      "There is nowhere to get to in this practice, no score to hit. The Tao Te Ching keeps pointing back to this: presence without agenda is already the destination.",
  },
  {
    text: "Water is fluid, soft, and yielding. But water will wear away rock, which is rigid and cannot yield.",
    author: "Lao Tzu",
    source: "Tao Te Ching, Chapter 78",
    context:
      "One of Taoism's favorite paradoxes: softness outlasts hardness. A gentle daily breath practice works the same way — not through force, but through quiet, patient repetition.",
  },
  {
    text: "Peace comes from within. Do not seek it without.",
    author: "The Buddha",
    source: "The Dhammapada",
    context:
      "A foundational reminder in Buddhist teaching: circumstances will never arrange themselves perfectly enough to grant peace on their own. It is cultivated, breath by breath, from the inside.",
  },
  {
    text: "You will not be punished for your anger, you will be punished by your anger.",
    author: "The Buddha",
    source: "Attributed teaching",
    context:
      "Buddhist psychology treats difficult emotions not as moral failures but as fires that burn the one holding them. Breath is one of the oldest tools for cooling that fire before it spreads.",
  },
  {
    text: "This too shall pass.",
    author: "Buddhist teaching",
    source: "Traditional teaching on impermanence",
    context:
      "Impermanence, or anicca, is one of Buddhism's three marks of existence. Every sensation in this breath — ease, tension, boredom, calm — is already changing as you notice it. Nothing here is asked to stay.",
  },
  {
    text: "The trouble is, you think you have time.",
    author: "Buddhist teaching",
    source: "Attributed to the Buddha",
    context:
      "A gentle, sobering line about impermanence and urgency — not meant to create anxiety, but to sharpen appreciation. This morning's ritual is not a rehearsal for some later, more important life. It is the life.",
  },
  {
    text: "Feelings come and go like clouds in a windy sky. Conscious breathing is my anchor.",
    author: "Thich Nhat Hanh",
    source: "Being Peace",
    context:
      "Thich Nhat Hanh returned to this image throughout his teaching: you are the sky, not the weather passing through it, and the breath is the steady thread that keeps you from being swept away by either.",
  },
  {
    text: "Breath is the bridge which connects life to consciousness, which unites your body to your thoughts.",
    author: "Thich Nhat Hanh",
    source: "The Miracle of Mindfulness",
    context:
      "For Thich Nhat Hanh, the breath was never just a physiological function — it was the one place where mind and body reliably meet. Every conscious breath is a small act of reunification.",
  },
  {
    text: "Smile, breathe, and go slowly.",
    author: "Thich Nhat Hanh",
    source: "Teachings on mindful living",
    context:
      "One of Thich Nhat Hanh's simplest and most repeated instructions — a whole practice compressed into six words. It costs nothing and asks for nothing except your attention, right now.",
  },
  {
    text: "Our own life is the instrument with which we experiment with truth.",
    author: "Thich Nhat Hanh",
    source: "Being Peace",
    context:
      "Thich Nhat Hanh taught that wisdom isn't collected from books alone — it is tested and known directly, in the living of an ordinary day, starting with how you meet this morning.",
  },
  {
    text: "It's not what happens to you, but how you react to it that matters.",
    author: "Epictetus",
    source: "Discourses",
    context:
      "Though a Stoic rather than Buddhist voice, this line has traveled alongside contemplative teaching for centuries because it points at the same freedom: the space between event and response is where a breath practice does its quiet work.",
  },
];
