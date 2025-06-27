import { Model } from 'objection';
// import User from './User.js'; // 추후 User 모델과의 관계 정의 시 필요

class Item extends Model {
  // 테이블 이름 지정
  static get tableName() {
    return 'items';
  }

  // (선택 사항) JSON 스키마를 사용한 데이터 유효성 검사
  // 이 스키마는 데이터베이스에 삽입되거나 업데이트되기 전에 데이터의 유효성을 검사합니다.
  static get jsonSchema() {
    return {
      type: 'object',
      required: ['name', 'user_id'], // user_id는 외래 키로 가정

      properties: {
        id: { type: 'integer' },
        name: { type: 'string', minLength: 1, maxLength: 255 },
        description: { type: ['string', 'null'] }, // 설명은 null일 수 있음
        user_id: { type: 'integer' }, // 아이템을 소유한 사용자의 ID
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' }
      }
    };
  }

  // (선택 사항) 다른 모델과의 관계 정의
  // static get relationMappings() {
  //   // User 모델을 동적으로 임포트하여 순환 참조 문제 방지
  //   const User = require('./User.js').default; // .default를 사용하여 ES6 모듈 export 가져오기

  //   return {
  //     owner: {
  //       relation: Model.BelongsToOneRelation,
  //       modelClass: User,
  //       join: {
  //         from: 'items.user_id',
  //         to: 'users.id'
  //       }
  //     }
  //   };
  // }

  // (선택 사항) 타임스탬프 자동 관리
  // $beforeInsert 및 $beforeUpdate 훅을 사용하여 created_at, updated_at 자동 설정
  async $beforeInsert() {
    await super.$beforeInsert();
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    this.created_at = now;
    this.updated_at = now;
  }

  async $beforeUpdate() {
    await super.$beforeUpdate();
    this.updated_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
  }
}

export default Item;
