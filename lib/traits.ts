export type TraitCode =
  | 'ENG' | 'COL' | 'RES' | 'SRG' | 'RSP'
  | 'INI' | 'RSL' | 'EMP' | 'COM' | 'CUR';

export interface Trait {
  code: TraitCode;
  name: string;
  description: string;
  positiveAnchors: string[];
  negativeAnchors: string[];
}

export const TRAITS: Trait[] = [
  {
    code: 'ENG',
    name: 'Engagement',
    description: 'Active participation and attentiveness in class',
    positiveAnchors: ['raised hand', 'asked a question', 'focused', 'participated actively'],
    negativeAnchors: ['distracted', 'on phone', 'zoned out', 'not paying attention'],
  },
  {
    code: 'COL',
    name: 'Collaboration',
    description: 'Working well with peers and contributing to teamwork',
    positiveAnchors: ['helped teammate', 'shared ideas', 'group work', 'cooperated'],
    negativeAnchors: ['refused to work with group', 'took over', 'excluded others'],
  },
  {
    code: 'RES',
    name: 'Respect',
    description: 'Treatment of teachers, peers, and property',
    positiveAnchors: ['polite', 'kind words', 'listened respectfully', 'helpful to teacher'],
    negativeAnchors: ['rude', 'talked back', 'damaged property', 'mocked peer'],
  },
  {
    code: 'SRG',
    name: 'Self-Regulation',
    description: 'Emotional control and impulse management',
    positiveAnchors: ['stayed calm', 'handled frustration', 'de-escalated', 'took a breath'],
    negativeAnchors: ['outburst', 'meltdown', 'disruptive', 'could not settle'],
  },
  {
    code: 'RSP',
    name: 'Responsibility',
    description: 'Completing tasks, homework, and being accountable',
    positiveAnchors: ['turned in homework', 'owned up to', 'prepared', 'on time'],
    negativeAnchors: ['missing homework', 'blamed others', 'unprepared', 'forgot materials'],
  },
  {
    code: 'INI',
    name: 'Initiative',
    description: 'Self-directed effort and volunteering',
    positiveAnchors: ['volunteered', 'went beyond', 'took lead', 'started without prompting'],
    negativeAnchors: ['waited to be told', 'avoided extra work', 'passive'],
  },
  {
    code: 'RSL',
    name: 'Resilience',
    description: 'Handling setbacks and persisting through difficulty',
    positiveAnchors: ['tried again', 'bounced back', 'did not give up', 'learned from mistake'],
    negativeAnchors: ['gave up quickly', 'shut down after failure', 'refused to retry'],
  },
  {
    code: 'EMP',
    name: 'Empathy',
    description: 'Consideration and care for others feelings',
    positiveAnchors: ['comforted a classmate', 'noticed someone upset', 'included others'],
    negativeAnchors: ['ignored distress', 'teased', 'laughed at mistakes'],
  },
  {
    code: 'COM',
    name: 'Communication',
    description: 'Expressing ideas clearly and listening well',
    positiveAnchors: ['explained clearly', 'listened attentively', 'articulate'],
    negativeAnchors: ['interrupted', 'unclear', 'did not listen', 'talked over others'],
  },
  {
    code: 'CUR',
    name: 'Curiosity',
    description: 'Asking questions and exploring beyond assignments',
    positiveAnchors: ['asked why', 'researched further', 'made connections', 'probed deeper'],
    negativeAnchors: ['disinterested', 'did minimum', 'no questions'],
  },
];

export function getTrait(code: TraitCode): Trait | undefined {
  return TRAITS.find((t) => t.code === code);
}
