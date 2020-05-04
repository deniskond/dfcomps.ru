import { Component, ChangeDetectionStrategy, Input, OnInit } from '@angular/core';
import { SMILES_CONFIG, SmileInterface } from '../../../../../../configs/smiles.config';

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
    @Input() comment: string;

    public messageParts: MessagePartInterface[];
    public messagePartTypes = MessagePartTypes;

    ngOnInit(): void {
        this.getMessageParts();
    }

    private getMessageParts(): void {
        const splitMessage = this.comment.split(/(\:\w+?\:)/gm);

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

        return SMILES_CONFIG.SMILES.find(({ name }: SmileInterface) => name === strippedColonsText);
    }
}
