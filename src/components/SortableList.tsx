import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import List from './List';
import type { ListRow, CardRow } from '@/types/dto';

interface SortableListProps {
  list: ListRow;
  cards: CardRow[];
  highlighted?: boolean;
  onUpdateList?: (id: string, data: { name?: string; position?: number }) => void;
  onCreateCard?: (listId: string, title: string) => void;
  onDeleteList?: (listId: string) => void;
}

export default function SortableList({ 
  list, 
  cards, 
  highlighted,
  onUpdateList,
  onCreateCard,
  onDeleteList
}: SortableListProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: list.id,
    data: { type: 'list', listId: list.id },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex-shrink-0 ${isDragging ? 'opacity-50' : ''}`}
      {...attributes}
    >
      <List
        title={list.name}
        listId={list.id}
        list={list}
        cards={cards}
        highlighted={highlighted}
        dragListeners={listeners}
        onUpdateList={onUpdateList}
        onCreateCard={onCreateCard}
        onDeleteList={onDeleteList}
      />
    </div>
  );
}
