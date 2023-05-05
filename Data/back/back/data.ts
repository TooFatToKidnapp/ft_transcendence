import { User } from 'src/user/entities/user.entity';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { Friendship } from './src/friendship/entities/friendship.entity';
import { Chat } from 'src/chat/entities/chat.entity';
import { Messages } from 'src/chat/entities/Messages.entity';

const DataConf : PostgresConnectionOptions = {
    type: 'postgres',
    host: 'database',
    port: 5432,
    username: 'postgres',
    password: 'evblood123',
    database: 'ft_transcendence',
    entities: [User, Friendship, Chat, Messages],
    synchronize: true,
}
export default DataConf;