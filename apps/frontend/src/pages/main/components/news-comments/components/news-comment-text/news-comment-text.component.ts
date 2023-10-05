import { Component, ChangeDetectionStrategy, Input, OnInit } from '@angular/core';
import { CommentInterface } from '@dfcomps/contracts';
import { SmileInterface, SMILES_CONFIG, SmileGroups } from '~shared/configs/smiles.config';
import { UserInterface } from '~shared/interfaces/user.interface';
import { PersonalSmileInterface } from '~shared/services/smiles/personal-smile.interface';

enum MessagePartTypes {
  SMILE,
  TEXT,
}

interface MessagePartInterface {
  type: MessagePartTypes;
  content: string | SmileInterface;
}

@Component({
  selector: 'app-news-comment-text',
  templateUrl: './news-comment-text.component.html',
  styleUrls: ['./news-comment-text.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewsCommentTextComponent implements OnInit {
  @Input() comment: CommentInterface;
  @Input() personalSmiles: PersonalSmileInterface[];
  @Input() currentUser: UserInterface;

  public messageParts: MessagePartInterface[];
  public messagePartTypes = MessagePartTypes;

  ngOnInit(): void {
    this.getMessageParts();
  }

  private getMessageParts(): void {
    const splitMessage = this.comment.comment.split(/(\:\w+?\:)/gm).filter((messagePart: string) => !!messagePart.trim());

    this.messageParts = splitMessage.map((messagePart: string) => {
      const smile: SmileInterface | null = this.getSmile(messagePart);

      return smile
        ? {
            type: MessagePartTypes.SMILE,
            content: smile,
          }
        : {
            type: MessagePartTypes.TEXT,
            content: messagePart,
          };
    });
  }

  private getSmile(text: string): SmileInterface | null {
    if (!text.match(/\:.*\:/gm)) {
      return null;
    }

    const strippedColonsText: string = text.substring(1, text.length - 1);
    const smile = SMILES_CONFIG.SMILES.find(({ name }: SmileInterface) => name === strippedColonsText);

    if (!smile) {
      return null;
    }

    return smile.group === SmileGroups.PERSONAL ? this.getPersonalSmile(smile) : smile;
  }

  private getPersonalSmile(smile: SmileInterface): SmileInterface | null {
    return this.personalSmiles.find(
      ({ playerId, smileAlias }: PersonalSmileInterface) =>
        playerId === this.comment.playerId && smileAlias === smile.name,
    )
      ? smile
      : null;
  }
}
