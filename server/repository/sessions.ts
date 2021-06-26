import uuid from "uuid/v4";

export interface ISession {
  id: string;
  sessionNm: string;
}

export class SessionsRepository {
  private static sessions: ISession[] = [];

  public static get getSessions(): ISession[] {
    return this.sessions;
  }

  public static addSession(sessionNm: string): ISession[] {
    this.sessions = this.sessions.concat({ sessionNm: sessionNm, id: uuid() });
    return this.sessions;
  }
}
